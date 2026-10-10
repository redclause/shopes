"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, ExternalLink, Link2, ShieldCheck, Sparkles } from "lucide-react";
import UserMenu from "../../components/UserMenu";
import styles from "./page.module.css";
import { backlinkSiteCatalog, backlinkSiteCategories } from "./site-catalog";

type Props = { userName: string; userEmail: string; userImage?: string | null; signOutAction: () => Promise<void> };
type Snippet = { id: string; title: string; description: string; value: string };
type SubmissionRecord = { id: string; targetUrl: string; candidateUrl: string; status: "review" | "submitted" | "published" | "rejected"; createdAt: string; updatedAt: string; note?: string };

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
  const [topic, setTopic] = useState("");
  const [candidateUrl, setCandidateUrl] = useState("");
  const [verifyResult, setVerifyResult] = useState<{status:string; message:string; checkedUrl?:string; targetUrl?:string; checkedAt?:string; note?:string; httpStatus?:number} | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [submissionRecords, setSubmissionRecords] = useState<SubmissionRecord[]>([]);
  const [submissionNote, setSubmissionNote] = useState("");
  const [publisherPermission, setPublisherPermission] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("All");
  const [catalogPage, setCatalogPage] = useState(1);
  const [policyResults, setPolicyResults] = useState<Record<string, { status: string; message: string; evidence?: { path: string; kind: string; httpStatus: number; matchedKeywords?: string[]; excerpt?: string; summary?: { appliesToAll: boolean; directives: string[] } }[]; note?: string }>>({});
  const [checkingPolicySite, setCheckingPolicySite] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("shopes-backlink-submissions-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSubmissionRecords(parsed.filter((item) => item && typeof item.id === "string" && typeof item.targetUrl === "string" && typeof item.candidateUrl === "string"));
      }
    } catch { /* Ignore malformed local history and keep the tool usable. */ }
    setRecordsLoaded(true);
  }, []);

  useEffect(() => {
    if (!recordsLoaded) return;
    try { window.localStorage.setItem("shopes-backlink-submissions-v1", JSON.stringify(submissionRecords)); }
    catch { setError("Browser storage is unavailable; submission history may not persist after this session."); }
  }, [submissionRecords, recordsLoaded]);

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

  const opportunitySearches = useMemo(() => {
    if (!generatedUrl) return [];
    const host = new URL(generatedUrl).hostname;
    const subject = topic.trim() || pageTitle.trim() || host;
    const queries = [
      { title: "Relevant resource pages", query: `"${subject}" (resources OR "useful links" OR references)` },
      { title: "Relevant directories", query: `"${subject}" (directory OR listings OR submit)` },
      { title: "Contributor and submission pages", query: `"${subject}" ("submit a resource" OR "write for us" OR contribute)` },
      { title: "Unlinked brand mentions", query: `"${host}" -site:${host}` },
      { title: "Relevant partner pages", query: `"${subject}" (partners OR associations OR recommended)` },
    ];
    return queries.map((item) => ({ ...item, googleUrl: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`, bingUrl: `https://www.bing.com/search?q=${encodeURIComponent(item.query)}` }));
  }, [generatedUrl, topic, pageTitle]);

  async function verifyBacklink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifying(true);
    setVerifyResult(null);
    try {
      const response = await fetch("/api/backlink-maker/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUrl: generatedUrl, candidateUrl: candidateUrl.trim() }) });
      const result = await response.json();
      setVerifyResult(result);
      if (result.status === "found") {
        setSubmissionRecords((current) => current.map((record) => record.targetUrl === generatedUrl && record.candidateUrl === candidateUrl.trim() ? { ...record, status: "published", updatedAt: new Date().toISOString() } : record));
      }
    } catch {
      setVerifyResult({ status: "error", message: "The verification request failed. Please try again." });
    } finally {
      setVerifying(false);
    }
  }

  function addSubmissionRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!generatedUrl || !candidateUrl.trim() || !publisherPermission) return;
    const now = new Date().toISOString();
    const record: SubmissionRecord = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, targetUrl: generatedUrl, candidateUrl: candidateUrl.trim(), status: "review", createdAt: now, updatedAt: now, note: submissionNote.trim() || undefined };
    setSubmissionRecords((current) => [record, ...current].slice(0, 100));
    setSubmissionNote("");
    setPublisherPermission(false);
  }

  function updateSubmissionStatus(id: string, status: SubmissionRecord["status"]) {
    setSubmissionRecords((current) => current.map((record) => record.id === id ? { ...record, status, updatedAt: new Date().toISOString() } : record));
  }

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return backlinkSiteCatalog.filter((site) =>
      (catalogCategory === "All" || site.category === catalogCategory) &&
      [site.name, site.domain, site.category, site.submissionMethod, site.notes].some((value) => value.toLowerCase().includes(query))
    );
  }, [catalogCategory, catalogSearch]);

  const catalogPageSize = 25;
  const catalogPageCount = Math.max(1, Math.ceil(filteredCatalog.length / catalogPageSize));
  const visibleCatalog = filteredCatalog.slice((catalogPage - 1) * catalogPageSize, catalogPage * catalogPageSize);

  async function checkSitePolicy(siteId: string) {
    setCheckingPolicySite(siteId);
    try {
      const response = await fetch("/api/backlink-maker/policy-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const result = await response.json();
      setPolicyResults((current) => ({ ...current, [siteId]: result }));
    } catch {
      setPolicyResults((current) => ({ ...current, [siteId]: { status: "error", message: "Could not inspect this site's public policy pages. Please review its official rules manually." } }));
    } finally {
      setCheckingPolicySite("");
    }
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
        {generatedUrl && (
          <section className={styles.results} aria-labelledby="opportunities-title">
            <div className={styles.eyebrow}><Sparkles size={14} /> DISCOVERY WORKSPACE</div>
            <h2 id="opportunities-title" style={{ margin: "9px 0 7px", fontSize: 23 }}>Find backlink opportunities</h2>
            <p style={{ color: "#aabac8", fontSize: 13, lineHeight: 1.7, marginTop: 0 }}>Shopes prepares focused searches using your page and topic. Open a search, review each website, and only submit where the site explicitly permits relevant links. Search results are not confirmed opportunities until you review them.</p>
            <label className={styles.field}><span>Topic or niche <small>(optional, improves searches)</small></span><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. sustainable home products" maxLength={120} /></label>
            <div className={styles.snippetList}>
              {opportunitySearches.map((item) => <article className={styles.snippet} key={item.title}>
                <div className={styles.snippetHead}><div><h3>{item.title}</h3><p>{item.query}</p></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a className={styles.export} href={item.googleUrl} target="_blank" rel="noreferrer">Google <ExternalLink size={13} /></a><a className={styles.export} href={item.bingUrl} target="_blank" rel="noreferrer">Bing <ExternalLink size={13} /></a></div></div>
              </article>)}
            </div>
            <section aria-labelledby="site-catalog-title" style={{ marginTop: 24 }}>
              <div className={styles.cardHeading}><span className={styles.iconTile}><Link2 size={19} /></span><div><h2 id="site-catalog-title">Website opportunity catalog</h2><p>{backlinkSiteCatalog.length.toLocaleString()} website candidates across communities, publishing, directories, reviews, startups, software marketplaces and social platforms. Each entry requires current policy review; catalog inclusion does not mean backlink placement is permitted.</p></div></div>
              <label className={styles.field}><span>Search catalog</span><input value={catalogSearch} onChange={(event) => { setCatalogSearch(event.target.value); setCatalogPage(1); }} placeholder="Search site name, domain, category or submission method" /></label>
              <label className={styles.field}><span>Category</span><select value={catalogCategory} onChange={(event) => { setCatalogCategory(event.target.value); setCatalogPage(1); }} style={{ width: "100%", minHeight: 46, padding: "10px 12px", border: "1px solid #334352", borderRadius: 10, background: "#0b1118", color: "#f3f8fc", font: "inherit", fontSize: 14 }}>
                {backlinkSiteCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select></label>
              <div className={styles.snippetList}>
                {visibleCatalog.map((site) => <article className={styles.snippet} key={site.id}>
                  <div className={styles.snippetHead}><div><h3>{site.name} <span style={{ color: "#8da2b3", fontWeight: 500 }}>· {site.category}</span></h3><p>{site.domain} · {site.submissionMethod}</p><p>{site.notes}</p><p style={{ color: "#f0c879", marginTop: 6 }}>Policy status: needs manual review</p>{site.sourceUrl && <p style={{ marginTop: 6 }}><a href={site.sourceUrl} target="_blank" rel="noopener noreferrer">Source list <ExternalLink size={12} /></a></p>}</div><a className={styles.export} href={site.url} target="_blank" rel="noopener noreferrer">Review site <ExternalLink size={13} /></a></div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" className={styles.export} onClick={() => { setCandidateUrl(site.url); setVerifyResult(null); }}>Use as candidate page</button>
                    <button type="button" className={styles.export} disabled={checkingPolicySite === site.id} onClick={() => checkSitePolicy(site.id)}>{checkingPolicySite === site.id ? "Checking rules…" : "Inspect public rules"}</button>
                  </div>
                  {policyResults[site.id] && <div className={styles.notice} role="status" style={{ marginTop: 12 }}>
                    <ShieldCheck size={18} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p><strong>{policyResults[site.id].status === "needs-human-review" ? "Policy evidence found — manual review required" : "Policy check result"}</strong><br />{policyResults[site.id].message}</p>
                      {policyResults[site.id].evidence?.map((item) => <div key={item.path} style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #334352" }}>
                        <p><strong>{item.path}</strong> · HTTP {item.httpStatus}{item.matchedKeywords?.length ? ` · Terms: ${item.matchedKeywords.join(", ")}` : ""}</p>
                        {item.summary?.directives?.length ? <p>robots.txt directives: {item.summary.directives.join("; ")}</p> : null}
                        {item.excerpt && <p style={{ overflowWrap: "anywhere" }}>{item.excerpt.slice(0, 420)}{item.excerpt.length > 420 ? "…" : ""}</p>}
                        <a href={new URL(item.path, site.url).toString()} target="_blank" rel="noopener noreferrer" className={styles.export}>Open page <ExternalLink size={13} /></a>
                      </div>)}
                      {policyResults[site.id].note && <p>{policyResults[site.id].note}</p>}
                    </div>
                  </div>}
                </article>)}
                {filteredCatalog.length === 0 && <p style={{ color: "#aabac8", fontSize: 13 }}>No catalog entries match this search.</p>}
              </div>
              {filteredCatalog.length > 0 && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
                <p style={{ color: "#aabac8", fontSize: 13, margin: 0 }}>Showing {(catalogPage - 1) * catalogPageSize + 1}–{Math.min(catalogPage * catalogPageSize, filteredCatalog.length)} of {filteredCatalog.length.toLocaleString()} candidates</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className={styles.export} disabled={catalogPage <= 1} onClick={() => setCatalogPage((page) => Math.max(1, page - 1))}>Previous</button>
                  <span style={{ color: "#aabac8", fontSize: 13, alignSelf: "center" }}>Page {catalogPage} / {catalogPageCount}</span>
                  <button type="button" className={styles.export} disabled={catalogPage >= catalogPageCount} onClick={() => setCatalogPage((page) => Math.min(catalogPageCount, page + 1))}>Next</button>
                </div>
              </div>}
              <div className={styles.notice}><ShieldCheck size={18} /><p><strong>Important:</strong> Catalog entries are candidate websites, not verified backlink placements. Check each site’s current official rules and relevance before submitting anything; only explicitly approved site-specific integrations may automate submission.</p></div>
            </section>
            <div className={styles.notice} style={{ marginTop: 16 }}><ShieldCheck size={18} /><p><strong>Honest status reporting:</strong> Search links open public search results in your browser; Shopes does not claim that a backlink has been submitted or published. Direct automated scraping of search engines is intentionally not used.</p></div>
            <form onSubmit={verifyBacklink} style={{ marginTop: 22 }}>
              <div className={styles.cardHeading}><span className={styles.iconTile}><Check size={19} /></span><div><h2>Verify a candidate page</h2><p>Paste a public page URL to check whether its HTML contains a link to your target.</p></div></div>
              <label className={styles.field}><span>Candidate page URL <b>*</b></span><input type="url" inputMode="url" placeholder="https://example.com/resources" value={candidateUrl} onChange={(event) => setCandidateUrl(event.target.value)} required /></label>
              <button className={styles.primary} type="submit" disabled={verifying} style={verifying ? { opacity: .7, cursor: "wait" } : undefined}>{verifying ? "Checking page…" : "Check for backlink"} <ArrowRight size={16} /></button>
            </form>
            <form onSubmit={addSubmissionRecord} style={{ marginTop: 22 }}>
              <div className={styles.cardHeading}><span className={styles.iconTile}><Clipboard size={19} /></span><div><h2>Submission tracker</h2><p>Track only a form you reviewed and that explicitly permits this type of relevant submission.</p></div></div>
              <label className={styles.field}><span>Submission note <small>(optional)</small></span><textarea value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} rows={2} maxLength={300} placeholder="e.g. Resource directory form; submission requires editor approval." /></label>
              <label className={styles.checkRow}><input type="checkbox" checked={publisherPermission} onChange={(event) => setPublisherPermission(event.target.checked)} /><span><strong>I reviewed this site and its rules permit this submission.</strong><small>Adding a record does not submit the form. Do not submit unsolicited links or bypass CAPTCHA, login, or anti-spam controls.</small></span></label>
              <button className={styles.primary} type="submit" disabled={!publisherPermission || !candidateUrl.trim()}><Clipboard size={16} /> Add to submission tracker</button>
            </form>
            {submissionRecords.length > 0 && <div style={{ marginTop: 20 }}>
              <div className={styles.cardHeading}><span className={styles.iconTile}><Check size={19} /></span><div><h2>Submission history</h2><p>Stored in this browser only; up to 100 records.</p></div></div>
              <div className={styles.snippetList}>
                {submissionRecords.map((record) => <article className={styles.snippet} key={record.id}>
                  <div className={styles.snippetHead}><div><h3>{record.status === "review" ? "Ready for review" : record.status === "submitted" ? "Submission sent" : record.status === "published" ? "Backlink verified" : "Not accepted"}</h3><p>{record.candidateUrl}</p><p>Target: {record.targetUrl}</p><p>Updated {new Date(record.updatedAt).toLocaleString()}</p></div><a className={styles.export} href={record.candidateUrl} target="_blank" rel="noreferrer">Open page <ExternalLink size={13} /></a></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {record.status !== "submitted" && record.status !== "published" && <button type="button" className={styles.export} onClick={() => updateSubmissionStatus(record.id, "submitted")}>Mark as submitted</button>}
                    {record.status !== "published" && <button type="button" className={styles.export} onClick={() => { setCandidateUrl(record.candidateUrl); setVerifyResult(null); }}>Verify backlink</button>}
                    {record.status !== "rejected" && <button type="button" className={styles.export} onClick={() => updateSubmissionStatus(record.id, "rejected")}>Mark not accepted</button>}
                  </div>
                </article>)}
              </div>
              <div className={styles.notice} style={{ marginTop: 12 }}><ShieldCheck size={18} /><p>Use “Mark published” only after the verification tool finds the target link on that page. Submission status is a user-confirmed record, not proof that the publisher accepted it.</p></div>
            </div>}
            {verifyResult && <div className={styles.notice} role="status" style={{ marginTop: 16, borderColor: verifyResult.status === "found" ? "#2c7569" : "#6c5960" }}><ShieldCheck size={18} /><p><strong>{verifyResult.status === "found" ? "Link found" : verifyResult.status === "not-found" ? "Link not found" : verifyResult.status === "redirect" ? "Page redirected" : "Could not verify"}</strong><br />{verifyResult.message}{verifyResult.httpStatus ? ` (HTTP ${verifyResult.httpStatus})` : ""}{verifyResult.checkedAt ? ` Checked at ${new Date(verifyResult.checkedAt).toLocaleString()}.` : ""}{verifyResult.note ? ` ${verifyResult.note}` : ""}</p></div>}
          </section>
        )}
        <footer className={styles.footer}>Shopes Backlink Maker <span>Build useful links. Avoid spam.</span></footer>
      </div>
    </main>
  );
}
