# Prototype run

## Input

Five chronological storyboard frames from the keynote’s toy-kitchen qualitative demo segment (approximately 10:58–12:01 in the source video). The frames were passed as image inputs in left-to-right order.

## What ran

```bash
node streambridge_proxy.mjs
```

The script sent the five frames to `moondream` through the local Ollama HTTP API. The prompt asked for exactly two lines: `ACTION: ANSWER_NOW` or `WAIT`, followed by a short grounded reason. This exercises the StreamBridge-style activation step only.

## Returned output

```text
" and water, which can be seen on the image of a room with a picture of a white box that reads "The first one, while it's like.
```

The call completed, but the response did not match the requested binary trigger format (`formatMatched: false`).

## Verdict

**Feasible with caveats.** The visual-call path is runnable, but this tiny proxy does not yet validate trigger accuracy. The input is a low-resolution storyboard of a keynote slide, and the proxy does not include the trained LLaVA-OneVision activation head, StreamBridge round-decay compression, or live latency measurement.
