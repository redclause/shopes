"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, ExternalLink, Link2, ShieldCheck, Sparkles } from "lucide-react";
import UserMenu from "../../components/UserMenu";
import styles from "./page.module.css";

type Props = { userName: string; userEmail: string; userImage?: string | null; signOutAction: () => Promise<void> };
type Snippet = { id: string; title: string; description: string; value: string };

function normalizeUrl(value: string) {
  const input = value.trim();
  const candidate = /^https?:\/\//i.test(input) ? input : "https://" + input;
  const parsed = new URL(candidate);
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) throw new Error("Invalid URL");
  return parsed.toString();
}

export default function BacklinkMakerClient({ userName, userEmail, userImage, signOutAction }: Props) {
  const [targetUrl, setTargetUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [description, setDescription] = useState("");
  const [nofollow, setNofollow] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const snippets = useMemo<Snippet[]>(() => {
    if (!generatedUrl) return [];
    const anchor = anchorText.trim() || pageTitle.trim() || generatedUrl;
    const title = pageTitle.trim() || anchor;
    const relation = nofollow ? ' rel="nofollow"' : "";
    const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    return [
      { id: "html", title: "HTML backlink", description: "For a website or page where you can edit HTML.", value: '<a href="' + esc(generatedUrl) + '" title="' + esc(title) + '"' + relation + '>' + esc(anchor) + '</a>' },
      { id: "markdown", title: "Markdown link", description: "For README files, Markdown posts, and documentation.", value: "[" + anchor.replaceAll("]", "\\]") + "](" + generatedUrl + ")" },
      { id: "bbcode", title: "BBCode link", description: "For communities and forums that allow BBCode links.", value: "[url=" + generatedUrl + "]" + anchor + "[/url]" },
      { id: "plaintext", title: "Plain-text URL", description: "For profiles, references, or listings that accept a raw URL.", value: generatedUrl },
      { id: "html-nofollow", title: "HTML nofollow link", description: "Useful for user-generated or untrusted placements.", value: '<a href="' + esc(generatedUrl) + '" rel="nofollow" title="' + esc(title) + '">' + esc(anchor) + '</a>' }
    ];
  }, [generatedUrl, anchorText, pageTitle, nofollow]);

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopiedId("");
    try { setGeneratedUrl(normalizeUrl(targetUrl)); }
    catch { setGeneratedUrl(""); setError("Enter a valid page URL, such as https://example.com/article."); }
  }

  async function copySnippet(id: string, value: string) {
    try { await navigator.clipboard.writeText(value); setCopiedId(id); }
    catch { setError("Clipboard access was blocked. Select and copy the snippet manually."); }
  }

  function downloadAll() {
    const content = snippets.map((snippet) => "### " + snippet.title + "\n" + snippet.value + "\n").join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "shopes-backlink-snippets.txt";
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Shopes home"><span className={styles.brandMark}><Link2 size={18} /></span><span>shopes<span>.</span></span></Link>
        <div className={styles.headerRight}><span className={styles.freeBadge}>SEO TOOL</span><UserMenu name={userName} email={userEmail} image={userImage} signOutAction={signOutAction} /></div>
      </header>
      <div className={styles.container}>
        <Link className={styles.back} href="/dashboard"><ArrowLeft size={15} /> Back to dashboard</Link>
        <section className={styles.intro}>
          <div className={styles.eyebrow}><Sparkles size={14} /> OFF-PAGE SEO WORKSPACE</div>
          <h1>Backlink <span>Maker</span></h1>
          <p>Create ready-to-publish link snippets for any URL — a homepage, product page, blog post, or individual resource. Choose a format, copy it, and place it only where you have permission to add links.</p>
        </section>
        <form className={styles.formCard} onSubmit={handleGenerate}>
          <div className={styles.cardHeading}><span className={styles.iconTile}><Link2 size={19} /></span><div><h2>Build your backlink snippet</h2><p>Start with the exact page you want people to discover.</p></div></div>
          <label className={styles.field}>
            <span>Target URL <b>*</b></span>
            <input type="text" inputMode="url" autoComplete="url" placeholder="https://example.com/your-page" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} required aria-describedby={error ? "url-error" : "url-help"} />
            <small id={error ? "url-error" : "url-help"} className={error ? styles.error : styles.help}>{error || "A full website or specific page URL is accepted."}</small>
          </label>
          <div className={styles.fieldsGrid}>
            <label className={styles.field}><span>Link title <small>(optional)</small></span><input value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} placeholder="e.g. Complete product guide" maxLength={160} /></label>
            <label className={styles.field}><span>Anchor text <small>(optional)</small></span><input value={anchorText} onChange={(event) => setAnchorText(event.target.value)} placeholder="e.g. Read the guide" maxLength={120} /></label>
          </div>
          <label className={styles.field}><span>Short description <small>(optional)</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A brief description for your own notes (not inserted into link snippets)." rows={3} maxLength={500} /></label>
          <label className={styles.checkRow}><input type="checkbox" checked={nofollow} onChange={(event) => setNofollow(event.target.checked)} /><span><strong>Use nofollow for the main HTML snippet</strong><small>Useful when the placement is user-generated or the link is not an editorial endorsement.</small></span></label>
          <button className={styles.primary} type="submit"><Sparkles size={16} /> Generate link snippets <ArrowRight size={16} /></button>
        </form>
        {snippets.length > 0 && (
          <section className={styles.results} aria-labelledby="results-title">
            <div className={styles.resultsHeading}>
              <div><div className={styles.eyebrow}><Check size={14} /> READY TO COPY</div><h2 id="results-title">Your backlink snippets</h2><p>Generated for <a href={generatedUrl} target="_blank" rel="noreferrer">{generatedUrl} <ExternalLink size={12} /></a></p></div>
              <button className={styles.export} type="button" onClick={downloadAll}><Download size={15} /> Export all</button>
            </div>
            {description.trim() && <p className={styles.descriptionNote}><strong>Your note:</strong> {description.trim()}</p>}
            <div className={styles.snippetList}>
              {snippets.map((snippet) => {
                const CopyIcon = copiedId === snippet.id ? Check : Clipboard;
                return <article className={styles.snippet} key={snippet.id}>
                  <div className={styles.snippetHead}><div><h3>{snippet.title}</h3><p>{snippet.description}</p></div><button type="button" onClick={() => copySnippet(snippet.id, snippet.value)}><CopyIcon size={15} />{copiedId === snippet.id ? "Copied" : "Copy"}</button></div>
                  <pre><code>{snippet.value}</code></pre>
                </article>;
              })}
            </div>
            <div className={styles.notice}><ShieldCheck size={18} /><p><strong>Important:</strong> These are link snippets, not published backlinks. A backlink only exists after another page publishes the link. Focus on relevant, useful placements; mass automated submissions can be treated as spam and may harm SEO.</p></div>
          </section>
        )}
        <footer className={styles.footer}>Shopes Backlink Maker <span>Build useful links. Avoid spam.</span></footer>
      </div>
    </main>
  );
}
