import { auth } from "../../../../../auth";
import {
  getSmolLM2BenchmarkPrompt,
  SMOLLM2_DTYPE,
  SMOLLM2_MAX_NEW_TOKENS,
  SMOLLM2_MODEL_ID,
} from "../../../../lib/smollm2-benchmark";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type TextGenerator = (
  prompt: string,
  options: { max_new_tokens: number; do_sample: boolean },
) => Promise<unknown>;

let generatorPromise: Promise<TextGenerator> | undefined;
let modelLoadedAt: number | null = null;
let activeRun = false;

function megabytes(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

async function getGenerator(): Promise<TextGenerator> {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      const { env, pipeline } = await import("@huggingface/transformers");
      // Vercel's writable filesystem is ephemeral; this cache is not durable.
      env.cacheDir = "/tmp/shopes-smollm2-cache";
      const loaded = await pipeline("text-generation", SMOLLM2_MODEL_ID, {
        dtype: SMOLLM2_DTYPE,
      });
      modelLoadedAt = Date.now();
      return loaded as unknown as TextGenerator;
    })();
  }

  try {
    return await generatorPromise;
  } catch (error) {
    generatorPromise = undefined;
    modelLoadedAt = null;
    throw error;
  }
}

export async function POST(request: Request) {
  // Hard-off by default, and impossible to enable on a Production deployment.
  if (
    process.env.SHOPES_SMOLLM2_PREVIEW_TEST !== "true" ||
    process.env.VERCEL_ENV === "production"
  ) {
    return new Response(null, { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  if (activeRun) {
    return Response.json(
      { error: "A benchmark is already running in this function instance." },
      { status: 429, headers: { "Retry-After": "10" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1024) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body: { task?: unknown };
  try {
    body = (await request.json()) as { task?: unknown };
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const selected = getSmolLM2BenchmarkPrompt(body.task);
  if (!selected) {
    return Response.json(
      { error: "Choose one of the fixed benchmark tasks: seo, keywords, or code." },
      { status: 400 },
    );
  }

  activeRun = true;
  const requestStartedAt = performance.now();
  const initialMemory = process.memoryUsage();
  let peakRss = initialMemory.rss;
  let peakHeapUsed = initialMemory.heapUsed;
  const sampleMemory = () => {
    const usage = process.memoryUsage();
    peakRss = Math.max(peakRss, usage.rss);
    peakHeapUsed = Math.max(peakHeapUsed, usage.heapUsed);
  };
  const sampler = setInterval(sampleMemory, 25);
  const wasModelAlreadyLoaded = modelLoadedAt !== null;
  let modelLoadMs = 0;

  try {
    const loadStartedAt = performance.now();
    const generator = await getGenerator();
    modelLoadMs = Math.round(performance.now() - loadStartedAt);
    const coldModelLoad = !wasModelAlreadyLoaded;
    const inferenceStartedAt = performance.now();
    const result = await generator(selected.prompt, {
      max_new_tokens: SMOLLM2_MAX_NEW_TOKENS,
      do_sample: false,
    });
    const inferenceMs = Math.round(performance.now() - inferenceStartedAt);
    sampleMemory();

    const first = Array.isArray(result)
      ? (result[0] as { generated_text?: unknown } | undefined)
      : undefined;
    const generatedText =
      typeof first?.generated_text === "string"
        ? first.generated_text
        : JSON.stringify(result);

    return Response.json(
      {
        model: SMOLLM2_MODEL_ID,
        quantization: SMOLLM2_DTYPE,
        task: selected.task,
        coldModelLoad,
        modelLoadMs,
        inferenceMs,
        handlerTotalMs: Math.round(performance.now() - requestStartedAt),
        baselineRssMb: megabytes(initialMemory.rss),
        peakRssMb: megabytes(peakRss),
        peakRssDeltaMb: megabytes(Math.max(0, peakRss - initialMemory.rss)),
        baselineHeapUsedMb: megabytes(initialMemory.heapUsed),
        peakHeapUsedMb: megabytes(peakHeapUsed),
        generatedChars: generatedText.length,
        generatedText: generatedText.slice(0, 5000),
        note: "Handler metrics do not include platform cold-start time before the handler begins. Compare with the Vercel Preview request duration.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    sampleMemory();
    const message =
      error instanceof Error ? error.message.slice(0, 300) : "Unknown model error.";
    return Response.json(
      {
        error: "The model benchmark failed.",
        detail: message,
        model: SMOLLM2_MODEL_ID,
        modelLoadMs,
        handlerTotalMs: Math.round(performance.now() - requestStartedAt),
        baselineRssMb: megabytes(initialMemory.rss),
        peakRssMb: megabytes(peakRss),
        peakRssDeltaMb: megabytes(Math.max(0, peakRss - initialMemory.rss)),
        note: "Check the Preview function logs. No fallback provider is used.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearInterval(sampler);
    activeRun = false;
  }
}
