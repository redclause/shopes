export const SMOLLM2_MODEL_ID = "onnx-community/SmolLM2-360M-ONNX";
export const SMOLLM2_DTYPE = "q4f16";
export const SMOLLM2_MAX_NEW_TOKENS = 96;

export const SMOLLM2_BENCHMARK_PROMPTS = {
  seo: `You are reviewing a fictional English product page for an SEO quality check. Identify only issues supported by the supplied HTML, then suggest one concise improvement. Do not invent search volume, rankings, traffic, or CPC.
HTML: <title>Blue Ceramic Coffee Mug</title><meta name="description" content=""><h1>Products</h1><img src="/mug.jpg">
Return a concise bullet list.`,
  keywords: `Group these English search phrases by likely search intent. Use only the supplied phrases, label each group, and do not invent search volume, CPC, or ranking data.
Phrases: best ceramic coffee mug, buy blue ceramic mug, how to clean a ceramic mug, ceramic mug gift ideas, blue mug 12 oz.
Return concise JSON with groups and intent labels.`,
  code: `Review this small JavaScript function for a likely bug. Explain the issue and show a corrected version. Do not claim you executed the code.
function average(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
Return the explanation and corrected code.`,
} as const;

export type SmolLM2BenchmarkTask = keyof typeof SMOLLM2_BENCHMARK_PROMPTS;

export function getSmolLM2BenchmarkPrompt(
  task: unknown,
): { task: SmolLM2BenchmarkTask; prompt: string } | null {
  if (
    typeof task !== "string" ||
    !Object.prototype.hasOwnProperty.call(SMOLLM2_BENCHMARK_PROMPTS, task)
  ) {
    return null;
  }

  const safeTask = task as SmolLM2BenchmarkTask;
  return { task: safeTask, prompt: SMOLLM2_BENCHMARK_PROMPTS[safeTask] };
}
