"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, ExternalLink, Link2, ListChecks, RotateCcw } from "lucide-react";
import styles from "./page.module.css";

type GeneratedLink = { url: string; label: string; html: string; markdown: string };

function getLabel(rawUrl: string, fallback: string) {
  try {
    const parsed = new URL(rawUrl);
    const segment = parsed.pathname.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment).replace(/[-_]+/g, " ") : parsed.hostname.replace(/^www\./, "");
  } catch {
    return fallback;
  }
}

function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function BacklinkMakerPage() {
  const [urls, setUrls] = useState("");
  const [anchor, setAnchor] = useState("");
  const [rel, setRel] = useState("dofollow");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    const seen = new Set<string>();
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const line of urls.split(/[\n,;\t]+/)) {
      const raw = line.trim();
      if (!raw) continue;
      const url = normalizeUrl(raw);
      if (!url) { invalid.push(raw); continue; }
      if (!seen.has(url)) { seen.add(url); valid.push(url); }
    }
    return { valid, invalid };
  }, [urls]);

  const generated: GeneratedLink[] = useMemo(() => parsed.valid.map((url) => {
    const label = anchor.trim() || getLabel(url, "Visit website");
    const safeLabel = label.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char));
    const safeUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const relAttr = rel === "nofollow" ? ' rel="nofollow"' : rel === "sponsored" ? ' rel="sponsored nofollow"' : "";
    return {
      url,
      label,
      html: `<a href="${safeUrl}"${relAttr}>${safeLabel}</a>`,
      markdown: `[${label.replace(/[\[\]]/g, "\\$&")}](${url})`,
    };
  }), [parsed.valid, anchor, rel]);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function exportResults() {
    const content = generated.map((item) => `URL: ${item.url}\nAnchor text: ${item.label}\nHTML: ${item.html}\nMarkdown: ${item.markdown}\n`).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "shopes-backlink-snippets.txt";
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/dashboard" className={styles.back}><ArrowLeft size={16} /> Dashboard</Link>
        <Link href="/" className={styles.brand}>shopes<span>.</span></Link>
      </header>
      <div className={styles.container}>
        <div className={styles.eyebrow}><Link2 size={15} /> OFF-PAGE SEO TOOL</div>
        <h1>Backlink Maker</h1>
        <p className={styles.lead}>Prepare backlink snippets for any page URL—not just a website homepage. Generate HTML and Markdown links in bulk, ready to share with partners, publishers, and relevant directories.</p>

        <section className={styles.workspace}>
          <div className={styles.formPanel}>
            <label htmlFor="target-urls">Target URL(s)</label>
            <textarea id="target-urls" value={urls} onChange={(event) => setUrls(event.target.value)} placeholder={"https://example.com/\nhttps://example.com/blog/my-article\nhttps://example.com/products/item"} rows={7} />
            <p className={styles.help}>Enter one URL per line. Article, product, category, and deep links are supported. URLs without a scheme are normalized to HTTPS.</p>

            <label htmlFor="anchor-text">Anchor text <span>optional</span></label>
            <input id="anchor-text" value={anchor} onChange={(event) => setAnchor(event.target.value)} placeholder="e.g. Read the full guide" />
            <p className={styles.help}>Leave empty to create a descriptive label from each URL.</p>

            <label htmlFor="link-attribute">Link attribute</label>
            <select id="link-attribute" value={rel} onChange={(event) => setRel(event.target.value)}>
              <option value="dofollow">Standard link (no rel attribute)</option>
              <option value="nofollow">rel="nofollow"</option>
              <option value="sponsored">Sponsored link (rel="sponsored nofollow")</option>
            </select>
            <div className={styles.actions}>
              <button className={styles.primary} onClick={() => { setUrls(""); setAnchor(""); setRel("dofollow"); setCopied(false); }}><RotateCcw size={16} /> Reset</button>
              <span className={styles.count}><ListChecks size={15} /> {generated.length} valid unique URL{generated.length === 1 ? "" : "s"}</span>
            </div>
          </div>

          <div className={styles.resultsPanel}>
            <div className={styles.resultsHead}>
              <div><h2>Generated link snippets</h2><p>Review and copy the code you want to share.</p></div>
              <button className={styles.secondary} disabled={!generated.length} onClick={() => copyText(generated.map((item) => item.html).join("\n"))}><Copy size={15} /> {copied ? "Copied!" : "Copy all HTML"}</button>
            </div>
            {parsed.invalid.length > 0 && <div className={styles.warning}><strong>{parsed.invalid.length} invalid entr{parsed.invalid.length === 1 ? "y" : "ies"} skipped</strong><p>{parsed.invalid.slice(0, 3).join(", ")}{parsed.invalid.length > 3 ? "…" : ""}</p></div>}
            {generated.length === 0 ? (
              <div className={styles.empty}><Link2 size={25} /><strong>Your generated snippets will appear here</strong><p>Add one or more full page URLs to get started.</p></div>
            ) : (
              <div className={styles.list}>
                {generated.map((item) => (
                  <article className={styles.result} key={item.url}>
                    <div className={styles.resultTitle}><strong>{item.label}</strong><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.url}`}><ExternalLink size={14} /></a></div>
                    <p className={styles.url}>{item.url}</p>
                    <label>HTML</label><pre><code>{item.html}</code></pre>
                    <label>Markdown</label><pre><code>{item.markdown}</code></pre>
                    <button className={styles.copyOne} onClick={() => copyText(item.html)}><Copy size={14} /> Copy HTML</button>
                  </article>
                ))}
              </div>
            )}
            <button className={styles.export} disabled={!generated.length} onClick={exportResults}><Download size={16} /> Export snippets (.txt)</button>
          </div>
        </section>

        <aside className={styles.notice}>
          <strong>Important: generating a link is not the same as publishing a backlink.</strong>
          <p>This tool creates reusable HTML/Markdown snippets for legitimate placements. It does not automatically post links to third-party websites, guarantee a backlink, or guarantee search-engine indexing. Publish links only where the site owner permits them and where they are useful to readers.</p>
        </aside>
      </div>
    </main>
  );
}
