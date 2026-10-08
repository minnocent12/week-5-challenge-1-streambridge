# Week 5 Challenge 1 — StreamBridge Activation Prototype

This repository contains the quick feasibility prototype for the Week 5 Video-LLM challenge. It is inspired by Afshin Dehghan's keynote, **“Advancing Video Understanding: From Training-Free to Streaming Video LLM.”**

## Problem

A streaming cooking assistant should not call the full Video-LLM on every incoming frame. It needs a lightweight activation step that decides whether to answer now or wait, while using the recent visual history as context.

## Prototype

`streambridge_proxy.mjs` performs the activation step:

1. It combines five chronological storyboard frames into one contact sheet.
2. It sends the contact sheet to a locally running Ollama vision model.
3. It asks the model to return `ACTION: ANSWER_NOW` or `ACTION: WAIT`, plus one grounded reason.
4. It parses the response and records the model output, action, latency, and limitations as JSON.

This is a feasibility test of the activation-call path. It is not a reproduction of the trained StreamBridge system: the prototype does not include the trained LLaVA-OneVision activation head, round-decay memory compression, or a live video stream.

## Run locally

From this repository directory:

```bash
npm install
ollama pull moondream
ollama serve
npm run prototype
```

If Ollama is already running in another terminal, only the last command is needed after installation. The script reads the committed frames in `.ppt-build/frame_*_up.jpg` and writes a fresh contact sheet and result record under `.ppt-build/`.

The default model is `moondream`. To use another Ollama vision model:

```bash
OLLAMA_MODEL=llava npm run prototype
```

## Included evidence

- `streambridge_proxy.mjs` — executable prototype.
- `prototype_run.md` — concise description of the recorded run and its caveats.
- `.ppt-build/prototype_result.json` — committed result record from a prior run.
- `.ppt-build/frame_*_up.jpg` — five chronological input frames.
- `keynote_notes.md` — notes connecting the problem to the keynote.
- `challenge_1.pptx` — submitted slide deck.

## Result status

- **Implemented:** the contact-sheet creation, Ollama request, response parser, and JSON result record.
- **Tested:** the local request path completed during the recorded run.
- **Not experimentally validated:** trigger accuracy was not established; the recorded model response did not match the required binary format.

## Sources

- Keynote: https://www.youtube.com/watch?v=kCuXBR6-3p4
- CVPR 2025 Video-LLM Workshop speakers page: https://www.crcv.ucf.edu/cvpr2025-vidllms-workshop/speakers.html
- StreamBridge paper: https://arxiv.org/abs/2505.05467
