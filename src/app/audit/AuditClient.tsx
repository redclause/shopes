"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, CircleAlert, Clock3, ExternalLink,
  Download, FileSearch, LoaderCircle, ShieldCheck, TriangleAlert, XCircle,
} from "lucide-react";
import styles from "./page.module.css";
import UserMenu from "../../components/UserMenu";
import { useShopesTranslation } from "../../lib/i18n/useShopesTranslation";

type Finding = {
  id: string;
  title: string;
  status: "pass" | "warning" | "error";
  detail: string;
};

type AuditResult = {
  url: string;
  status: number;
  checkedAt: string;
  findings: Finding[];
  summary: { total: number; passed: number; warnings: number; errors: number };
  limitations: string[];
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AuditClient({ userName, userEmail, userImage, signOutAction }: { userName: string; userEmail: string; userImage?: string | null; signOutAction: () => Promise<void> }) {
  const { t } = useShopesTranslation();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | Finding["status"]>("all");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const requestedUrl = new URLSearchParams(window.location.search).get("url");
    if (requestedUrl) setUrl(requestedUrl);
  }, []);

  const visibleFindings = result?.findings.filter((finding) => statusFilter === "all" || finding.status === statusFilter) ?? [];

  function severity(finding: Finding): string {
    if (finding.status === "error") return "High";
    if (finding.id === "robots" && /noindex/i.test(finding.detail)) return "Critical";
    if (finding.status === "warning" && ["title", "http-status", "canonical", "structured-data"].includes(finding.id)) return "High";
    if (finding.status === "warning") return "Medium";
    return "Informational";
  }

  function recommendation(finding: Finding): string {
    const guidance: Record<string, string> = {
      "http-status": "Confirm the intended page returns a successful response and redirects to the preferred URL.",
      title: "Write a unique, descriptive title that accurately summarizes the page.",
      description: "Add a unique, useful meta description that describes the page to potential visitors.",
      canonical: "Choose the preferred absolute URL and add one canonical link when appropriate.",
      "canonical-count": "Keep at most one consistent canonical link pointing to the preferred URL.",
      h1: "Use a clear primary heading and review the surrounding heading structure.",
      "heading-content": "Ensure the H1 contains meaningful visible text.",
      "images-alt": "Add contextual alt text to informative images; use empty alt text for decorative images.",
      links: "Add descriptive internal links where they help visitors discover related pages.",
      robots: "Review meta robots and response headers to ensure the page can be indexed when intended.",
      viewport: "Add a responsive viewport meta tag and test the layout on mobile screen sizes.",
      "open-graph": "Add accurate og:title, og:description, and og:image values for social previews.",
      "structured-data": "Validate JSON-LD syntax and separately verify schema properties.",
    };
    return guidance[finding.id] || "Review the evidence and confirm whether this applies to the page's intended behavior.";
  }

  function saveReportLocally() {
    if (!result) return;
    try {
      const key = "shopes:audit-history:v1";
      const previous = JSON.parse(window.localStorage.getItem(key) || "[]") as Array<Record<string, unknown>>;
      const saved = { ...result, findings: result.findings.map((finding) => ({ ...finding, severity: severity(finding), recommendation: recommendation(finding) })), savedAt: new Date().toISOString() };
      window.localStorage.setItem(key, JSON.stringify([saved, ...previous.filter((item) => item.url !== result.url || item.checkedAt !== result.checkedAt)].slice(0, 30)));
      setSaveMessage("Report saved in this browser. It will not sync across devices.");
    } catch {
      setSaveMessage("Could not save locally. Browser storage may be unavailable or full.");
    }
  }

  function exportReport() {
    if (!result) return;
    const payload = { ...result, findings: result.findings.map((finding) => ({ ...finding, severity: severity(finding), recommendation: recommendation(finding) })), reportType: "single-page HTML audit; not a full-site crawl" };
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "shopes-audit-report.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  }

  async function runAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The audit could not be completed.");
      setResult(data as AuditResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The audit could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><span className={styles.brandMark}><FileSearch size={18} /></span><span>shopes<span className={styles.brandDot}>.</span></span></Link>
        <div className={styles.headerActions}>
          <nav className={styles.backLink} aria-label="Main navigation">
            <Link href="/dashboard">Dashboard</Link><Link href="/audit" aria-current="page">Site Audit</Link><Link href="/keyword-research">Keyword Research</Link><Link href="/product-intelligence">Product Analysis</Link><Link href="/">Home</Link>
          </nav>
          <UserMenu name={userName} email={userEmail} image={userImage} signOutAction={signOutAction} />
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.eyebrow}><ShieldCheck size={14} /> TECHNICAL SEO</div>
        <h1>Run a website audit.</h1>
        <p className={styles.intro}>Check the core HTML signals of a public page. This first version audits one page at a time and does not need a connected database.</p>

        <section className={styles.formCard} aria-labelledby="audit-form-title">
          <div className={styles.cardHeading}>
            <div className={styles.iconBox}><FileSearch size={20} /></div>
            <div><h2 id="audit-form-title">Start a new audit</h2><p>Enter the public URL you want to inspect.</p></div>
          </div>
          <form onSubmit={runAudit} className={styles.form}>
            <label htmlFor="website-url">Website URL</label>
            <div className={styles.inputRow}>
              <input id="website-url" name="url" type="text" inputMode="url" autoComplete="url" placeholder="https://example.com" value={url} onChange={(event) => setUrl(event.target.value)} required maxLength={2048} aria-describedby="url-help" disabled={loading} />
              <button type="submit" disabled={loading || !url.trim()}>{loading ? <><LoaderCircle className={styles.spin} size={16} /> Auditing…</> : <>Run audit <ArrowRight size={16} /></>}</button>
            </div>
            <p id="url-help" className={styles.help}>Only public HTTP/HTTPS websites on standard ports are accepted. The request is limited to one HTML page.</p>
          </form>
          {loading && <div className={styles.loading} role="status"><LoaderCircle className={styles.spin} size={18} /><span>Fetching the page and checking its HTML signals…</span></div>}
          {error && <div className={styles.errorBox} role="alert"><CircleAlert size={18} /><div><strong>Audit couldn’t be completed</strong><p>{error}</p></div></div>}
        </section>

        {result && (
          <section className={styles.results} aria-labelledby="results-title" aria-live="polite">
            <div className={styles.resultsHeader}>
              <div><div className={styles.eyebrow}><CheckCircle2 size={14} /> AUDIT COMPLETE</div><h2 id="results-title">Technical overview</h2><a className={styles.auditedUrl} href={result.url} target="_blank" rel="noreferrer">{result.url} <ExternalLink size={13} /></a></div>
              <div className={styles.timestamp}><Clock3 size={14} /> {formatTime(result.checkedAt)}</div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}><span>Checks passed</span><strong>{result.summary.passed}</strong></div>
              <div className={styles.summaryCard}><span>Warnings</span><strong>{result.summary.warnings}</strong></div>
              <div className={styles.summaryCard}><span>Errors</span><strong>{result.summary.errors}</strong></div>
            </div>

            <div className={styles.findingsToolbar}>
              <label>{t("filterFindings")} <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                <option value="all">{t("allResults")}</option><option value="error">Errors</option><option value="warning">Warnings</option><option value="pass">{t("passedChecks")}</option>
              </select></label>
              <div className={styles.reportActions}>
                <button type="button" className={styles.secondaryButton} onClick={saveReportLocally}>{t("saveInBrowser")}</button>
                <button type="button" className={styles.secondaryButton} onClick={exportReport}><Download size={15} /> {t("exportJsonReport")}</button>
              </div>
            </div>
            {saveMessage && <p className={styles.saveMessage} role="status">{saveMessage}</p>}
            <div className={styles.findings}>
              {visibleFindings.map((finding) => {
                const Icon = finding.status === "pass" ? CheckCircle2 : finding.status === "error" ? XCircle : TriangleAlert;
                return <article className={styles.finding} key={finding.id}>
                  <span className={styles.findingIcon + " " + styles[finding.status]}><Icon size={17} /></span>
                  <div className={styles.findingCopy}><h3>{finding.title} <span className={styles.severityLabel}>{severity(finding)} {t("priority")}</span></h3><p>{finding.detail}</p><p className={styles.recommendation}><strong>{t("recommendedNextStep")}</strong> {recommendation(finding)}</p></div>
                  <span className={styles.statusLabel + " " + styles[finding.status]}>{finding.status === "pass" ? "Passed" : finding.status === "error" ? "Issue" : "Review"}</span>
                </article>;
              })}
            </div>

            <div className={styles.limits}><strong>What this audit does not cover</strong><ul>{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <button className={styles.secondaryButton} onClick={() => { setResult(null); setError(""); }} type="button">Run another audit</button>
          </section>
        )}

        <aside className={styles.securityNote}><ShieldCheck size={17} /><p><strong>Built with request limits.</strong> The audit blocks private and reserved IP ranges, rechecks redirects, pins the request to a validated public address, and limits redirects, time, and HTML size.</p></aside>
      </div>
    </main>
  );
}
