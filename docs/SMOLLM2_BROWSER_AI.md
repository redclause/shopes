# Shopes AI Lab — SmolLM2 browser inference

## What this is
The `/ai-small` route is an experimental browser-only workspace using `HuggingFaceTB/SmolLM2-360M-Instruct` through Transformers.js. It is deliberately separate from existing SEO tools until the model's quality and runtime behavior are measured.

## Runtime behavior
- Model files are downloaded from Hugging Face on first use and may be cached by the browser.
- Inference is attempted with WebGPU first, then with the Transformers.js default runtime.
- Prompt text is passed to the browser model; Shopes does not send prompts to an application API route.
- The interface reports model-load and generation durations. These are wall-clock measurements, not a formal benchmark.
- Performance, memory use, and output quality depend on the browser, device, and model runtime. The page does not claim to measure peak memory.

## Known limitations
- A 360M-parameter model is not a substitute for a hosted frontier model. Verify generated facts and all SEO recommendations.
- Initial downloads can be large and may fail on low-memory devices, unsupported browsers, or restricted networks.
- The runtime fallback needs testing on actual devices before the feature is considered production-ready.
- This is not yet wired into Keyword Research, audits, or product analysis; those features must continue to work without loading the model.

## Validation checklist
1. Install dependencies and run `npm run typecheck`, `npm run lint`, and `npm run build`.
2. Open `/ai-small` in Chromium on a WebGPU-capable device and run each starter prompt.
3. Test fallback on a browser/device without WebGPU.
4. Record cold model load time, warm load time, inference time, browser version, and device details.
5. Verify offline/cached behavior, cancellation/reload recovery, and memory use with browser developer tools.
6. Compare output quality against the task requirements before integrating any model output into SEO features.
