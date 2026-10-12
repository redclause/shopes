# SmolLM2 Preview-only runtime benchmark

## Purpose

Determine whether the compact English-language SmolLM2-360M ONNX model can be loaded and used in a Vercel Preview Function without a paid AI API or a separate inference host. This is a measurement experiment, not a production AI feature.

Model card: https://huggingface.co/onnx-community/SmolLM2-360M-ONNX  
Transformers.js docs: https://huggingface.co/docs/transformers.js  
License shown by the model repository: Apache-2.0.

The ONNX repository contains several variants. This test requests the `q4f16` variant; the model file is listed at roughly 272 MB. Actual download volume also includes tokenizer/config files and may vary. The repository's full size is not the same as the selected variant's download size.

## Safety gates

- The endpoint is `POST /api/internal/smollm2-benchmark`.
- It returns 404 unless `SHOPES_SMOLLM2_PREVIEW_TEST=true`.
- It also returns 404 whenever `VERCEL_ENV=production`, even if the flag is mistakenly set.
- It requires an existing authenticated Shopes session.
- It accepts only a task identifier (`seo`, `keywords`, or `code`); it does not accept arbitrary prompts.
- It generates at most 96 new tokens, allows only one active run per warm function instance, and has a 60-second function duration cap.
- No UI entry point is added; the route is not linked from the product.
- Model files are fetched from the public Hugging Face model repository and cached only under `/tmp`. Vercel's temporary filesystem is ephemeral, so a new instance may download files again.
- No model files, credentials, or secrets are committed. No fallback API/provider is used.

## Enabling the test (manual action required)

Do not add this variable to Production. To run the benchmark, a maintainer must explicitly add `SHOPES_SMOLLM2_PREVIEW_TEST=true` to the Vercel **Preview environment only**, then redeploy the Preview deployment. This repository change does not modify Vercel settings.

If the Vercel Preview deployment has no accessible authenticated session, do not weaken authentication to make the test work.

## Run the three benchmark cases

Using an authenticated browser session on the Preview deployment, send a POST request to `/api/internal/smollm2-benchmark` with one of these JSON bodies:

```json
{"task":"seo"}
{"task":"keywords"}
{"task":"code"}
```

The response records model-load time, inference time, handler time, baseline RSS/heap, peak RSS/heap, peak RSS delta, and the generated output. Platform cold-start time before the handler begins is not included in `handlerTotalMs`; compare it with the request duration shown in Vercel logs.

Run one case at a time. Record the first request separately from later requests to distinguish model download/load from warm inference. Repeat each case only a few times; stop if requests approach the 60-second cap, memory approaches the configured limit, the deployment reports errors, or Vercel usage changes unexpectedly.

## Acceptance criteria

The experiment is acceptable only if all of these are true:

1. Model loading and all three tasks finish within the 60-second function cap.
2. Peak RSS stays below 3.0 GiB (leaving at least 1 GiB headroom on a 4 GiB function).
3. No out-of-memory, timeout, ONNX runtime, or model-download errors occur.
4. Outputs are coherent and in English, and do not fabricate SEO metrics.
5. Vercel usage shows no unexpected paid usage. A Pro plan and included credit are not proof of zero incremental cost; verify actual usage before repeating tests.
6. The test route is confirmed to return 404 in Production and when the feature flag is absent.

The 3 GiB threshold is a conservative project test criterion, not a claim about Vercel's billing or hard limits.

## Current status

Preparing this PR does not execute inference and does not prove runtime compatibility. CI can verify types, lint, build, and fixed-prompt tests. Real model load time, peak memory, quality, and cost impact require a manually enabled Preview test and must be recorded from its actual response/logs.

No Production variables are changed and this PR must not be merged without explicit approval.
