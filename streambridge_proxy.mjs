import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const frameFiles = [0, 1, 2, 3, 4].map((i) =>
  path.join(root, ".ppt-build", `frame_${i}_up.jpg`),
);
const contactSheetPath = path.join(root, ".ppt-build", "contact_sheet.jpg");
const model = process.env.OLLAMA_MODEL ?? "moondream";
const resultPath = path.resolve(root, process.env.RESULT_PATH ?? ".ppt-build/prototype_result_v2.json");
const oldResultPath = path.join(root, ".ppt-build", "prototype_result.json");

async function createContactSheet(framePaths, outputPath) {
  const tileSize = 320;
  const labelHeight = 56;
  const gap = 8;
  const tileHeight = tileSize + labelHeight;
  const width = framePaths.length * tileSize + (framePaths.length - 1) * gap;

  const tileBuffers = await Promise.all(framePaths.map(async (framePath, index) => {
    const image = await sharp(framePath)
      .resize(tileSize, tileSize, { fit: "cover", position: "centre" })
      .jpeg({ quality: 90 })
      .toBuffer();

    const labelSvg = Buffer.from(`
      <svg width="${tileSize}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#111827"/>
        <text x="${tileSize / 2}" y="36" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#F9FAFB">
          Frame ${index + 1}
        </text>
      </svg>
    `);

    return sharp({
      create: {
        width: tileSize,
        height: tileHeight,
        channels: 3,
        background: "#111827",
      },
    })
      .composite([
        { input: image, left: 0, top: 0 },
        { input: labelSvg, left: 0, top: tileSize },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();
  }));

  await sharp({
    create: {
      width,
      height: tileHeight,
      channels: 3,
      background: "#374151",
    },
  })
    .composite(tileBuffers.map((input, index) => ({
      input,
      left: index * (tileSize + gap),
      top: 0,
    })))
    .jpeg({ quality: 90 })
    .toFile(outputPath);
}

function parseAction(output) {
  const strictMatch = output.match(/ACTION\s*:\s*(ANSWER_NOW|WAIT)\b/i);
  if (strictMatch) {
    return {
      formatMatched: true,
      strictAction: strictMatch[1].toUpperCase(),
      action: strictMatch[1].toUpperCase(),
    };
  }

  const lower = output.toLowerCase();
  const waitPatterns = [
    /not\s+yet/,
    /hold\s+off/,
    /wait/,
    /not\s+ready/,
    /not\s+now/,
  ];
  const answerPatterns = [
    /go\s+ahead/,
    /answer\s+now/,
    /ready/,
    /right\s+now/,
    /\bnow\b/,
  ];

  const waitMatch = waitPatterns.find((pattern) => pattern.test(lower));
  const answerMatch = answerPatterns.find((pattern) => pattern.test(lower));

  let action = "UNKNOWN";
  if (waitMatch && !answerMatch) action = "WAIT";
  if (answerMatch && !waitMatch) action = "ANSWER_NOW";
  if (waitMatch && answerMatch) {
    const waitIndex = lower.search(waitMatch);
    const answerIndex = lower.search(answerMatch);
    action = waitIndex <= answerIndex ? "WAIT" : "ANSWER_NOW";
  }

  return { formatMatched: false, strictAction: null, action };
}

await createContactSheet(frameFiles, contactSheetPath);

const prompt = [
  "You are a strict visual activation gate in a StreamBridge-style proactive cooking assistant.",
  "The single image contains exactly 5 numbered video frames in chronological order from left to right.",
  "The labels identify Frame 1, Frame 2, Frame 3, Frame 4, and Frame 5.",
  "Judge Frame 5 specifically, using the earlier frames only as context.",
  "Decide whether Frame 5 shows a clear cooking-step transition or a moment where timely guidance should be given now.",
  "Return exactly two lines and nothing else:",
  "ACTION: ANSWER_NOW or WAIT",
  "REASON: one short sentence grounded in visible content, explicitly mentioning Frame 5.",
  "Worked example response:",
  "ACTION: ANSWER_NOW",
  "REASON: Frame 5 shows the food ready for the next step, so guidance is timely.",
  "Now inspect the supplied contact sheet and answer for the actual frames.",
].join("\n");

const contactSheetBase64 = (await fs.readFile(contactSheetPath)).toString("base64");
const startedAt = Date.now();
const response = await fetch("http://127.0.0.1:11434/api/generate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    model,
    prompt,
    images: [contactSheetBase64],
    stream: false,
  }),
});
const latencyMs = Date.now() - startedAt;

if (!response.ok) throw new Error(`Ollama request failed: ${response.status}`);
const result = await response.json();
const output = String(result.response ?? "").trim();
const parsed = parseAction(output);
const verdict = parsed.action === "UNKNOWN"
  ? "not yet demonstrated"
  : "feasible with caveats";

const record = {
  input: "five chronological storyboard frames from the keynote's toy-kitchen demo segment",
  contactSheet: ".ppt-build/contact_sheet.jpg",
  model: `${model} via local Ollama`,
  prompt,
  output,
  ...parsed,
  latencyMs,
  verdict,
  caveat: "This proxy exercises the StreamBridge activation decision but does not reproduce the paper's trained LLaVA-OneVision activation head, round-decay compression, or live latency.",
};

await fs.writeFile(resultPath, JSON.stringify(record, null, 2));

let oldRecord = null;
try {
  oldRecord = JSON.parse(await fs.readFile(oldResultPath, "utf8"));
} catch {
  oldRecord = { error: "Existing prototype_result.json was not available" };
}

console.log("\n=== OLD RESULT: prototype_result.json ===");
console.log(JSON.stringify(oldRecord, null, 2));
console.log(`\n=== NEW RESULT: ${path.basename(resultPath)} ===`);
console.log(JSON.stringify(record, null, 2));
