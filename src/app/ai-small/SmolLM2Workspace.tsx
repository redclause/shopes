"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, BrainCircuit, Check, CircleAlert, Cpu, LoaderCircle, MessageSquareText, Sparkles, Trash2, Zap } from "lucide-react";
import styles from "./page.module.css";

const MODEL_ID = "HuggingFaceTB/SmolLM2-360M-Instruct";
type Generator = (prompt: string, options?: Record<string, unknown>) => Promise<unknown>;
type GeneratedItem = { generated_text?: string | Array<{ role?: string; content?: string }> };

const starters = [
  { label: "SEO title ideas", prompt: "Suggest 5 clear, search-friendly SEO titles for an online store selling handmade candles. Keep each title under 60 characters." },
  { label: "Product description", prompt: "Write a helpful product description template for a reusable stainless-steel water bottle. Include benefits, features, and a concise call to action. Do not invent certifications." },
  { label: "Keyword clustering", prompt: "Group these example keywords by search intent and explain each group briefly: free art apps for pc, best drawing software, photoshop alternatives, digital painting for beginners." },
  { label: "Content outline", prompt: "Create a practical H2/H3 blog outline for the topic 'free art apps for pc'. Avoid repetitive headings and include a useful comparison section." },
];

function extractText(result: unknown): string {
  if (!Array.isArray(result) || !result.length) return "";
  const item = result[0] as GeneratedItem;
  if (typeof item.generated_text === "string") return item.generated_text;
  if (Array.isArray(item.generated_text)) {
    const last = [...item.generated_text].reverse().find((part) => part.role === "assistant");
    return last?.content || item.generated_text.map((part) => part.content || "").join("\n");
  }
  return "";
}

export default function SmolLM2Workspace() {
  const generatorRef = useRef<Generator | null>(null);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "generating" | "error">("idle");
  const [error, setError] = useState("");
  const [modelSeconds, setModelSeconds] = useState<number | null>(null);
  const [inferenceSeconds, setInferenceSeconds] = useState<number | null>(null);
  const [runtime, setRuntime] = useState("Browser runtime");
  const [tokens, setTokens] = useState(220);

  async function loadModel() {
    if (generatorRef.current) return generatorRef.current;
    setStatus("loading");
    setError("");
    const started = performance.now();
    try {
      const transformers = await import("@huggingface/transformers");
      transformers.env.allowLocalModels = false;
      transformers.env.useBrowserCache = true;
      const pipelineFactory = transformers.pipeline as unknown as (
        task: string, model: string, options?: Record<string, unknown>
      ) => Promise<Generator>;
      let generator: Generator;
      try {
        generator = await pipelineFactory("text-generation", MODEL_ID, { device: "webgpu" });
        setRuntime("WebGPU");
      } catch {
        generator = await pipelineFactory("text-generation", MODEL_ID);
        setRuntime("WebAssembly");
      }
      generatorRef.current = generator;
      setModelSeconds((performance.now() - started) / 1000);
      setStatus("ready");
      return generator;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The model could not be loaded.";
      setError(message + " Check your connection, browser support, and available memory, then try again.");
      setStatus("error");
      throw cause;
    }
  }

  async function runPrompt(value = prompt) {
    const clean = value.trim();
    if (!clean || status === "loading" || status === "generating") return;
    setPrompt(clean);
    setAnswer("");
    setError("");
    setStatus("generating");
    const started = performance.now();
    try {
      const generator = await loadModel();
      setStatus("generating");
      const result = await generator(
        "<|system|>You are Shopes AI, a concise and practical assistant for e-commerce, SEO, keyword research, and content planning. Be honest about uncertainty and never invent performance data.</|system|>\n<|user|>" + clean + "</|user|>\n<|assistant|>",
        { max_new_tokens: tokens, do_sample: true, temperature: 0.65, top_p: 0.9, repetition_penalty: 1.12 }
      );
      const raw = extractText(result);
      const marker = raw.lastIndexOf("<|assistant|>");
      setAnswer((marker >= 0 ? raw.slice(marker + "<|assistant|>".length) : raw).trim() || "The model returned an empty response. Try a shorter prompt.");
      setInferenceSeconds((performance.now() - started) / 1000);
      setStatus("ready");
    } catch {
      // loadModel already stores a helpful error when model loading fails.
      if (!error) setError("Generation failed. Try a shorter prompt or reload the model.");
      setStatus("error");
    }
  }

  function clearConversation() {
    setPrompt("");
    setAnswer("");
    setError("");
    setInferenceSeconds(null);
    setStatus(generatorRef.current ? "ready" : "idle");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span className={styles.brandMark}><Sparkles size={18} /></span><span>shopes<span className={styles.brandDot}>.</span><small>AI LAB</small></span></Link>
        <Link className={styles.back} href="/"><ArrowLeft size={15} /> Back to Shopes</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}><span /> PRIVATE, IN-BROWSER AI</div>
        <h1>A small model.<br /><span>Useful work.</span></h1>
        <p>Try SmolLM2-360M-Instruct for practical SEO, product copy, and content planning. The model runs in your browser after its first download; prompts are processed locally, not sent to a Shopes AI server.</p>
        <div className={styles.modelPill}><BrainCircuit size={16} /><span>SmolLM2 · 360M parameters</span><i>Experimental</i></div>
      </section>

      <section className={styles.workspace} aria-label="SmolLM2 prompt workspace">
        <div className={styles.panelHead}>
          <div className={styles.panelIcon}><MessageSquareText size={18} /></div>
          <div><h2>AI workspace</h2><p>Ask one focused question and review the generated result.</p></div>
          <button className={styles.clear} onClick={clearConversation} disabled={!prompt && !answer}><Trash2 size={14} /> Clear</button>
        </div>

        <div className={styles.starters}>
          <span className={styles.fieldLabel}>START WITH A TASK</span>
          <div className={styles.starterGrid}>
            {starters.map((starter) => <button key={starter.label} onClick={() => { setPrompt(starter.prompt); setError(""); }} className={styles.starter}><Sparkles size={14} />{starter.label}</button>)}
          </div>
        </div>

        <label className={styles.fieldLabel} htmlFor="smol-prompt">YOUR PROMPT</label>
        <textarea id="smol-prompt" className={styles.prompt} value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={3000} placeholder="For example: Create a non-repetitive content outline for free art apps for pc…" rows={5} />
        <div className={styles.promptMeta}><span>{prompt.length}/3,000 characters</span><label>Response length <select value={tokens} onChange={(event) => setTokens(Number(event.target.value))}><option value={120}>Short</option><option value={220}>Balanced</option><option value={350}>Detailed</option></select></label></div>

        {error && <div className={styles.error} role="alert"><CircleAlert size={17} /><span>{error}</span></div>}

        <button className={styles.run} onClick={() => void runPrompt()} disabled={!prompt.trim() || status === "loading" || status === "generating"}>
          {status === "loading" ? <><LoaderCircle className={styles.spin} size={17} /> Downloading model…</> : status === "generating" ? <><LoaderCircle className={styles.spin} size={17} /> Generating…</> : <><Zap size={17} /> {status === "error" ? "Try again" : "Run with SmolLM2"} <span>→</span></>}
        </button>
        {status === "loading" && <p className={styles.loadingNote}>First run downloads the model files and may take a few minutes. Keep this tab open.</p>}

        <div className={styles.output}>
          <div className={styles.outputHead}><span><Sparkles size={15} /> MODEL OUTPUT</span>{answer && <span className={styles.complete}><Check size={13} /> Generated</span>}</div>
          {answer ? <div className={styles.answer}>{answer}</div> : <div className={styles.placeholder}><div><Cpu size={22} /></div><strong>Your result will appear here</strong><p>Small models can make mistakes. Verify facts, keyword data, and recommendations before publishing.</p></div>}
          {(modelSeconds !== null || inferenceSeconds !== null) && <div className={styles.metrics}><span><Check size={13} /> Model loaded: {modelSeconds?.toFixed(1)}s</span>{inferenceSeconds !== null && <span><Zap size={13} /> Run time: {inferenceSeconds.toFixed(1)}s</span>}<span><Cpu size={13} /> {runtime}</span></div>}
        </div>
      </section>

      <footer className={styles.footer}><span>SHOPES AI LAB</span><p>Experimental local inference · Requires a modern browser and sufficient memory. First model download uses bandwidth and browser cache.</p><a href="https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct" target="_blank" rel="noreferrer">Model card ↗</a></footer>
    </main>
  );
}
