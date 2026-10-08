# Keynote notes

Source: [Keynote Talk 3: Afshin Dehghan, Apple](https://www.youtube.com/watch?v=kCuXBR6-3p4), “Advancing Video Understanding: From Training-Free to Streaming Video LLM” (32 minutes; auto-captions, so timestamps below are approximate).

## Main argument

Video understanding can advance in stages: first, push image-trained vision-language models (VLMs) to handle video with better frame selection; second, fine-tune the architecture and data recipe on video; third, add memory and response timing so a Video-LLM can operate continuously and proactively on a live stream. The speaker’s central design concern is the tradeoff between spatial detail, temporal coverage, context limits, and response latency.

## Core themes

- Context limits make naive “feed every frame to an LLM” approaches lose detail on longer videos (about 02:07–03:41).
- SlowFast-LLaVA uses two frame streams: high-resolution, low-frame-rate frames for spatial detail plus low-resolution, high-frame-rate frames for temporal coverage (about 04:12–05:16).
- SlowFast-LLaVA 1.5 adds a simple two-stage fine-tuning recipe: image warm-up, then a video data mixture, while preserving the same two-stream idea (about 06:53–08:55).
- Streaming assistants need a bounded memory buffer, compression for incoming frames, and an activation mechanism that decides when to answer (about 13:37–16:12).
- The speaker frames proactive assistance as a multi-turn task: for example, a user asks how to cook something once, then the model decides when later visual events justify guidance (about 14:08–14:39).

## Named tools and what each does

- **SlowFast-LLaVA**: training-free video understanding using a slow high-resolution pathway and a fast low-resolution pathway before the decoder LLM.
- **SlowFast-LLaVA 1.5**: fine-tuned successor using the same two-stream architecture and a two-stage image/video training recipe.
- **StreamBridge**: modular framework for adapting an offline Video-LLM to streaming use. It combines a small activation VLM with round-decay compression of the memory buffer.
- **Stream-IT**: dataset introduced for streaming video understanding, covering proactive assistance and multi-turn stream Q&A with interleaved video/text segments.
- **LLaVA-OneVision**: the approximately 0.5B model used as the base for StreamBridge’s binary activation module that predicts “answer now” versus “wait.”
- **P-LLaVA, Video-LLaVA, and Q-Former / BLIP-2**: related methods or baselines discussed while motivating token pooling and learned token selection.
- **GPT**: used in the Stream-IT data construction process to generate diverse question/answer variants from captioned video clips.

## Examples and demos shown

- Open-ended and multiple-choice video QA benchmark comparisons for the training-free SlowFast-LLaVA setup (about 05:16–06:21).
- Fine-grained description of a person drawing, including entities and actions (about 09:56–10:28).
- Toy-kitchen video QA: describe the sequence, answer what happens after washing toy fruit, and count toy fruits (about 10:58–12:01).
- Text-rich video QA about signing a paper, paper title, and author list; the speaker also showed an answer error in a name (about 12:01–13:05).
- StreamBridge timing demo: the activation module waits on earlier frames, then triggers a full Video-LLM response when the visual state warrants it; the response and visual history remain in memory (about 16:45–19:51 and 28:51–30:28).

## Evidence used for the problem choice

The proposed problem is inspired by the keynote’s explicit cooking-assistant example (about 14:08–14:39) and by the StreamBridge design requirement for “answer now versus wait” decisions (about 16:45–18:19). The workshop page also describes the talk as a progression from training-free methods to streaming Video-LLMs for real-time, proactive assistants: [UCF VidLLMs speakers page](https://www.crcv.ucf.edu/cvpr2025-vidllms-workshop/speakers.html).
