# SmolLM2 Keyword Intent — Preview-only integration

Adds an optional AI intent-grouping step to Keyword Research. Existing browser-local keyword generation remains the default and is not replaced.

## Preview enablement only
Set `SHOPES_SMOLLM2_KEYWORD_INTENT=true` in Vercel Preview only and redeploy Preview. Do not set this in Production. The endpoint hard-blocks `VERCEL_ENV=production`.

Endpoint: `POST /api/keyword-research/ai-intent` (authenticated Shopes session required). Body: `{"keywords":["best coffee mug","buy blue mug"]}`. Accepts 1–30 phrases, maximum 100 characters each. One model run per warm function instance; generation capped at 160 tokens.

## Safety and limitations
- AI suggestions must be reviewed before use.
- No search volume, CPC, rankings, traffic, or keyword difficulty is fetched or invented.
- If disabled, unavailable, malformed, or over the memory threshold, existing local results remain unchanged.
- The model is downloaded from Hugging Face and cached under ephemeral `/tmp`; cold instances may download again.
- Actual latency, peak memory, quality, and Vercel usage remain unverified until Preview is configured and run. The 30-second function cap and 3 GiB RSS check are safeguards, not proof of fit or zero incremental cost.
