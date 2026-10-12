import test from "node:test";
import assert from "node:assert/strict";
import {
  getSmolLM2BenchmarkPrompt,
  isSmolLM2PreviewBenchmarkEnabled,
  isValidSmolLM2PreviewToken,
  SMOLLM2_BENCHMARK_PROMPTS,
  SMOLLM2_DTYPE,
  SMOLLM2_MAX_NEW_TOKENS,
  SMOLLM2_MODEL_ID,
} from "../src/lib/smollm2-benchmark.ts";

test("uses the Transformers.js ONNX model and compact quantization", () => {
  assert.equal(SMOLLM2_MODEL_ID, "onnx-community/SmolLM2-360M-ONNX");
  assert.equal(SMOLLM2_DTYPE, "q4f16");
  assert.ok(SMOLLM2_MAX_NEW_TOKENS > 0 && SMOLLM2_MAX_NEW_TOKENS <= 128);
});

test("exposes only the three fixed English benchmark tasks", () => {
  assert.deepEqual(Object.keys(SMOLLM2_BENCHMARK_PROMPTS).sort(), [
    "code",
    "keywords",
    "seo",
  ]);
  for (const prompt of Object.values(SMOLLM2_BENCHMARK_PROMPTS)) {
    assert.match(prompt, /^[\x00-\x7F]*$/);
    assert.ok(prompt.length < 1000);
  }
});

test("accepts a known task and returns a fixed prompt", () => {
  const selected = getSmolLM2BenchmarkPrompt("seo");
  assert.equal(selected?.task, "seo");
  assert.match(selected?.prompt ?? "", /do not invent search volume/i);
});

test("rejects arbitrary prompts and unknown task names", () => {
  assert.equal(getSmolLM2BenchmarkPrompt("write arbitrary content"), null);
  assert.equal(getSmolLM2BenchmarkPrompt({ task: "seo" }), null);
  assert.equal(getSmolLM2BenchmarkPrompt(null), null);
});

test("feature flag is off by default and cannot enable production", () => {
  assert.equal(isSmolLM2PreviewBenchmarkEnabled(undefined, "preview"), false);
  assert.equal(isSmolLM2PreviewBenchmarkEnabled("true", "preview"), true);
  assert.equal(isSmolLM2PreviewBenchmarkEnabled("true", "production"), false);
  assert.equal(isSmolLM2PreviewBenchmarkEnabled("TRUE", "preview"), false);
});

test("benchmark token must be configured, long enough, and match exactly", () => {
  const token = "a".repeat(40);
  assert.equal(isValidSmolLM2PreviewToken(undefined, token), false);
  assert.equal(isValidSmolLM2PreviewToken("short", "short"), false);
  assert.equal(isValidSmolLM2PreviewToken(token, null), false);
  assert.equal(isValidSmolLM2PreviewToken(token, "b".repeat(40)), false);
  assert.equal(isValidSmolLM2PreviewToken(token, token), true);
});

test("does not interpolate user-supplied text into prompts", () => {
  assert.deepEqual(
    getSmolLM2BenchmarkPrompt("keywords"),
    getSmolLM2BenchmarkPrompt("keywords"),
  );
});
