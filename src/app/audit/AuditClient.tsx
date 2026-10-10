"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Clock3, ExternalLink,
  FileSearch, LoaderCircle, ShieldCheck, TriangleAlert, XCircle,
} from "lucide-react";
import styles from "./page.module.css";

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

export default function AuditClient() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={15} /> Back to dashboard</Link>
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

            <div className={styles.findings}>
              {result.findings.map((finding) => {
                const Icon = finding.status === "pass" ? CheckCircle2 : finding.status === "error" ? XCircle : TriangleAlert;
                return <article className={styles.finding} key={finding.id}>
                  <span className={styles.findingIcon + " " + styles[finding.status]}><Icon size={17} /></span>
                  <div className={styles.findingCopy}><h3>{finding.title}</h3><p>{finding.detail}</p></div>
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
