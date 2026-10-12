import test from "node:test";
import assert from "node:assert/strict";
import {
  getSmolLM2BenchmarkPrompt,
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

test("does not interpolate user-supplied text into prompts", () => {
  const first = getSmolLM2BenchmarkPrompt("keywords");
  const second = getSmolLM2BenchmarkPrompt("keywords");
  assert.deepEqual(first, second);
});
