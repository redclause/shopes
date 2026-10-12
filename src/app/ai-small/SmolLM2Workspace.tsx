"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, FileSearch, Link2, Search, Sparkles, Trash2 } from "lucide-react";
import styles from "./page.module.css";

const initialTitle = "Free Art Apps for PC: 9 Tools Worth Trying";
const initialDescription = "Explore free art apps for PC for drawing, painting, and illustration. Compare beginner-friendly options and find the right tool for your creative workflow.";
const initialUrl = "https://example.com/free-art-apps-for-pc";

function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}

export default function SmolLM2Workspace() {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [url, setUrl] = useState(initialUrl);
  const [keyword, setKeyword] = useState("free art apps for pc");
  const [copied, setCopied] = useState("");
  const [checked, setChecked] = useState(false);

  const analysis = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    const titleHasKeyword = Boolean(normalizedKeyword) && title.toLocaleLowerCase().includes(normalizedKeyword);
    const descriptionHasKeyword = Boolean(normalizedKeyword) && description.toLocaleLowerCase().includes(normalizedKeyword);
    let validUrl = false;
    try {
      const parsed = new URL(url);
      validUrl = parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      validUrl = false;
    }
    return { titleHasKeyword, descriptionHasKeyword, validUrl, slugHasKeyword: Boolean(normalizedKeyword) && url.toLocaleLowerCase().includes(normalizedKeyword.replace(/\s+/g, "-")) };
  }, [title, description, url, keyword]);

  function reset() {
    setTitle("");
    setDescription("");
    setUrl("");
    setKeyword("");
    setCopied("");
    setChecked(false);
  }

  function copy(value: string, label: string) {
    copyText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span className={styles.brandMark}><Sparkles size={18} /></span><span>shopes<span className={styles.brandDot}>.</span><small>SEO PREVIEW</small></span></Link>
        <Link className={styles.back} href="/"><ArrowLeft size={15} /> Back to Shopes</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}><span /> FREE SEO TOOL · NO MODEL DOWNLOAD</div>
        <h1>Preview your search result.<br /><span>Improve the snippet.</span></h1>
        <p>Draft and check a page title, meta description, URL, and focus keyword before publishing. See a Google-style preview, spot missing keyword placement, and copy the metadata — instantly, in your browser, with no AI model, API key, or paid service.</p>
        <div className={styles.modelPill}><Search size={16} /><span>Search snippet preview</span><i>Free · Browser-based</i></div>
      </section>

      <section className={styles.workspace} aria-label="SEO snippet preview tool">
        <div className={styles.panelHead}>
          <div className={styles.panelIcon}><FileSearch size={18} /></div>
          <div><h2>SEO snippet studio</h2><p>Enter the metadata you plan to publish and review it below.</p></div>
          <button className={styles.clear} onClick={reset} disabled={!title && !description && !url && !keyword}><Trash2 size={14} /> Clear</button>
        </div>

        <label className={styles.fieldLabel} htmlFor="seo-title">PAGE TITLE</label>
        <input id="seo-title" className={styles.prompt} style={{ minHeight: "unset", height: 48, resize: "none" }} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Write a clear, specific page title" />
        <div className={styles.promptMeta}><span>{title.length} characters · display width varies by device</span><span style={{ color: title.length >= 30 && title.length <= 60 ? "#b8f36b" : "#f2be63" }}>{title.length <= 60 ? "Typical title length" : "May be truncated"}</span></div>

        <label className={styles.fieldLabel} htmlFor="seo-description">META DESCRIPTION</label>
        <textarea id="seo-description" className={styles.prompt} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={400} placeholder="Summarize the page accurately and give searchers a reason to visit…" rows={4} />
        <div className={styles.promptMeta}><span>{description.length} characters</span><span style={{ color: description.length >= 120 && description.length <= 160 ? "#b8f36b" : "#f2be63" }}>{description.length <= 160 ? "Typical description length" : "May be truncated"}</span></div>

        <label className={styles.fieldLabel} htmlFor="seo-url">PAGE URL</label>
        <input id="seo-url" className={styles.prompt} style={{ minHeight: "unset", height: 48, resize: "none" }} value={url} onChange={(event) => setUrl(event.target.value)} maxLength={500} placeholder="https://example.com/your-page" />
        <div className={styles.promptMeta}><span>Use the canonical URL you intend to publish.</span><span style={{ color: analysis.validUrl ? "#b8f36b" : "#f2be63" }}>{analysis.validUrl ? "Valid URL format" : "Enter a full http(s) URL"}</span></div>

        <label className={styles.fieldLabel} htmlFor="seo-keyword">FOCUS KEYWORD (OPTIONAL)</label>
        <input id="seo-keyword" className={styles.prompt} style={{ minHeight: "unset", height: 48, resize: "none" }} value={keyword} onChange={(event) => setKeyword(event.target.value)} maxLength={120} placeholder="e.g. free art apps for pc" />
        
        <div className={styles.output}>
          <div className={styles.outputHead}><span><Search size={15} /> SEARCH RESULT PREVIEW</span><span className={styles.complete}>Live preview</span></div>
          <div className={styles.answer} style={{ padding: 20 }}>
            <div style={{ color: "#b2bdcc", fontSize: 11, marginBottom: 5, overflowWrap: "anywhere" }}>{url || "https://example.com/your-page"}</div>
            <div style={{ color: "#8ab4f8", fontSize: 20, lineHeight: 1.35, marginBottom: 5, overflowWrap: "anywhere" }}>{title || "Your page title will appear here"}</div>
            <div style={{ color: "#bdc1c6", fontSize: 13, lineHeight: 1.6, overflowWrap: "anywhere" }}>{description || "Your meta description preview will appear here. Search engines may choose a different snippet for a query."}</div>
            <p style={{ color: "#77869a", fontSize: 10, lineHeight: 1.6, margin: "14px 0 0" }}>Illustrative preview only. Google may rewrite titles and snippets, and actual truncation depends on query, device, and rendered width.</p>
          </div>
        </div>

        <div className={styles.output} style={{ marginTop: 14 }}>
          <div className={styles.outputHead}><span><Link2 size={15} /> QUICK CHECKS</span><span>On-page hints</span></div>
          <div className={styles.answer} style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Focus keyword appears in title", ok: analysis.titleHasKeyword, detail: "Use the exact phrase naturally when it fits." },
              { label: "Focus keyword appears in description", ok: analysis.descriptionHasKeyword, detail: "Explain the page value; avoid keyword stuffing." },
              { label: "URL includes the keyword slug", ok: analysis.slugHasKeyword, detail: "A readable URL is helpful, but exact keyword matching is not mandatory." },
              { label: "URL format is valid", ok: analysis.validUrl, detail: "Use your actual canonical URL before publishing." },
            ].map((item) => <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: item.ok ? "#b8f36b" : "#f2be63", flexShrink: 0, paddingTop: 1 }}>{item.ok ? <Check size={16} /> : <span aria-hidden="true">○</span>}</span>
              <div><strong style={{ fontSize: 12 }}>{item.label}</strong><p style={{ color: "#8997a9", fontSize: 11, lineHeight: 1.6, margin: "4px 0 0" }}>{item.detail}</p></div>
            </div>)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <button className={styles.run} style={{ flex: 1, minWidth: 180 }} onClick={() => copy(`Title: ${title}\nMeta description: ${description}\nURL: ${url}`, "all")}><Copy size={16} /> {copied === "all" ? "Copied metadata" : "Copy all metadata"} <span>→</span></button>
          <button className={styles.clear} onClick={() => { setChecked(true); }}><Check size={14} /> Mark reviewed</button>
        </div>
        {checked && <p style={{ color: "#b8f36b", fontSize: 11, marginTop: 12 }}>Reviewed. Remember to verify the final page source and canonical URL after publishing.</p>}
      </section>

      <footer className={styles.footer}><span>SHOPES SEO TOOLS</span><p>Free, local-first utility. No model download, API key, or SEO performance claims. Character guidance is approximate, not a Google ranking rule.</p><Link href="/keyword-research">Open Keyword Research ↗</Link></footer>
    </main>
  );
}
