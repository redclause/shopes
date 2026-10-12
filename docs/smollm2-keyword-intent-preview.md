# SmolLM2 Keyword Intent — Preview-only integration

This PR adds an optional AI intent-grouping step to Keyword Research. Existing browser-local keyword generation remains the default and is not replaced.

## Preview enablement only
Set `SHOPES_SMOLLM2_KEYWORD_INTENT=true` in Vercel Preview only and redeploy Preview. Do not set this in Production. The endpoint also hard-blocks `VERCEL_ENV=production`. No environment settings are changed by this PR.

Endpoint: `POST /api/keyword-research/ai-intent` (requires an authenticated Shopes session).
Body: `{"keywords":["best coffee mug","buy blue mug"]}`. Accepts 1–30 phrases, max 100 characters each. One model run per warm function instance; output capped at 160 tokens; response rejects malformed output and filters phrases to exact supplied strings.

## Limitations and safety
- Outputs are AI-generated suggestions; review before use.
- It does not fetch or generate search volume, CPC, rankings, traffic, or keyword difficulty.
- If disabled, unavailable, malformed, or over the memory threshold, existing local results remain unchanged.
- Model is downloaded from Hugging Face and cached under ephemeral `/tmp`; cold instances may download again. Actual latency, peak memory, and Vercel usage remain unverified until Preview is configured and run.
- A 30-second function cap and a 3 GiB RSS check are safeguards, not proof that the workload fits every deployment plan.
