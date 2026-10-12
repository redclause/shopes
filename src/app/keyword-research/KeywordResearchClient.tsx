"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowDownUp, Download, FileUp, Save, Search, Sparkles, Target, Upload, X } from "lucide-react";
import {
  exportKeywordCsv, generateKeywordIdeas, parseImportedSerpData, summarizeDomainOverlap, SUPPORTED_KEYWORD_LANGUAGES,
  type ImportedSerpRecord, type KeywordIdea, type KeywordLanguage, type SearchIntent,
} from "./engine";
import styles from "./page.module.css";
import UserMenu from "../../components/UserMenu";
import { LOCALE_STORAGE_KEY } from "../../lib/i18n/languages";
import { useShopesTranslation } from "../../lib/i18n/useShopesTranslation";

const PAGE_SIZE = 10;
const LOCALE_TO_KEYWORD_LANGUAGE: Record<string, KeywordLanguage> = {
  en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
  it: "Italian", nl: "Dutch", ru: "Russian", uk: "Ukrainian", tr: "Turkish", ar: "Arabic",
  hi: "Hindi", zh: "Chinese", "zh-TW": "Chinese", ja: "Japanese", ko: "Korean", id: "Indonesian", vi: "Vietnamese",
  pl: "Polish", sv: "Swedish",
};
const INTENTS: Array<"All" | SearchIntent> = ["All", "Informational", "Commercial", "Transactional", "Navigational", "Local", "Unclassified"];

export default function KeywordResearchClient({ userName, userEmail, userImage, signOutAction }: { userName: string; userEmail: string; userImage?: string | null; signOutAction: () => Promise<void> }) {
  const { t } = useShopesTranslation();
  const [seed, setSeed] = useState("");
  const [submittedSeed, setSubmittedSeed] = useState("");
  const [country, setCountry] = useState("US");
  const [language, setLanguage] = useState<KeywordLanguage>("English");
  const [languageNotice, setLanguageNotice] = useState("");
  useEffect(() => {
    const syncLocale = (code: string) => {
      const selected = LOCALE_TO_KEYWORD_LANGUAGE[code];
      if (selected && SUPPORTED_KEYWORD_LANGUAGES.includes(selected)) {
        setLanguage(selected);
        setLanguageNotice("");
        setPage(1);
        setSelected([]);
      } else {
        setLanguageNotice("Keyword generation rules are not yet available for this interface language. Choose one of the 19 supported research languages below.");
      }
    };
    try { syncLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY) || "en"); }
    catch { syncLocale("en"); }
    const onLocaleChange = (event: Event) => {
      const custom = event as CustomEvent<{ locale?: string }>;
      if (custom.detail?.locale) syncLocale(custom.detail.locale);
    };
    window.addEventListener("shopes:locale-change", onLocaleChange);
    return () => window.removeEventListener("shopes:locale-change", onLocaleChange);
  }, []);
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<"All" | SearchIntent>("All");
  const [cluster, setCluster] = useState("All");
  const [sort, setSort] = useState<"opportunity" | "phrase" | "intent">("opportunity");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [dataset, setDataset] = useState<ImportedSerpRecord[]>([]);
  const [datasetName, setDatasetName] = useState("");
  const [datasetError, setDatasetError] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");
  const [aiIntentLoading, setAiIntentLoading] = useState(false);
  const [aiIntentError, setAiIntentError] = useState("");
  const [aiIntentResult, setAiIntentResult] = useState<{label:string;metrics:string;groups:Array<{label:string;intent:string;keywords:string[]}>;recommendations:string[]}|null>(null);

  const allIdeas = useMemo(() => {
    if (!generated) return [];
    try { return generateKeywordIdeas(submittedSeed, language); } catch { return []; }
  }, [generated, submittedSeed, language]);

  const filtered = useMemo(() => allIdeas
    .filter((item) => item.phrase.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    .filter((item) => intent === "All" || item.intent === intent)
    .filter((item) => cluster === "All" || item.cluster === cluster)
    .sort((a, b) => sort === "intent"
      ? a.intent.localeCompare(b.intent) || a.phrase.localeCompare(b.phrase)
      : sort === "phrase"
        ? a.phrase.localeCompare(b.phrase)
        : b.opportunityScore - a.opportunityScore || b.relevanceScore - a.relevanceScore || a.phrase.localeCompare(b.phrase)),
  [allIdeas, query, intent, cluster, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const domainOverlap = useMemo(() => summarizeDomainOverlap(dataset), [dataset]);

  async function runAiIntentGrouping() {
    const phrases = allIdeas.slice(0, 30).map((item) => item.phrase);
    if (!phrases.length) return;
    setAiIntentLoading(true); setAiIntentError(""); setAiIntentResult(null);
    try {
      const response = await fetch("/api/keyword-research/ai-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keywords: phrases }) });
      const payload = await response.json() as { error?: string; label?: string; metrics?: string; groups?: Array<{label:string;intent:string;keywords:string[]}>; recommendations?: string[] };
      if (!response.ok || !payload.groups) throw new Error(payload.error || "AI keyword grouping is unavailable.");
      setAiIntentResult({ label: payload.label || "AI-generated suggestions; review before use.", metrics: payload.metrics || "No verified SEO metrics were used.", groups: payload.groups, recommendations: payload.recommendations || [] });
    } catch (caught) { setAiIntentError(caught instanceof Error ? caught.message : "AI keyword grouping is unavailable. Your local results are unchanged."); }
    finally { setAiIntentLoading(false); }
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = seed.trim().replace(/\s+/g, " ");
    if (!clean) return;
    if (clean.length > 120) { setError("Seed keyword must be 120 characters or fewer."); return; }
    setError("");
    setSeed(clean);
    setSubmittedSeed(clean);
    setGenerated(true);
    setPage(1);
    setSelected([]);
  }

  function downloadCsv(filename: string, csv: string) {
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportCsv() {
    const rows = selected.length ? allIdeas.filter((item) => selected.includes(item.normalized)) : allIdeas;
    if (rows.length) downloadCsv("shopes-keyword-research.csv", exportKeywordCsv(rows, country, language));
  }

  function saveKeywordSet() {
    const rows = selected.length ? allIdeas.filter((item) => selected.includes(item.normalized)) : allIdeas;
    if (!rows.length) return;
    try {
      const key = "shopes:keyword-sets:v1";
      const parsed: unknown = JSON.parse(window.localStorage.getItem(key) || "[]");
      const previous = Array.isArray(parsed) ? parsed : [];
      const item = { id: Date.now().toString(), seed: submittedSeed, country, language, savedAt: new Date().toISOString(), keywords: rows };
      window.localStorage.setItem(key, JSON.stringify([item, ...previous].slice(0, 30)));
      setSaveMessage(rows.length + " keyword ideas saved in this browser only.");
    } catch {
      setSaveMessage("Could not save this keyword set. Browser storage may be unavailable or full.");
    }
  }

  async function importDataset(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDatasetError("");
    setImportedCount(0);
    try {
      if (file.size > 2_000_000) throw new Error("The file exceeds the 2 MB import limit.");
      const format = file.name.toLowerCase().endsWith(".json") ? "json" : file.name.toLowerCase().endsWith(".csv") ? "csv" : null;
      if (!format) throw new Error("Choose a .csv or .json file.");
      const parsed = parseImportedSerpData(await file.text(), format, file.name);
      setDataset(parsed);
      setDatasetName(file.name);
      setImportedCount(parsed.length);
    } catch (caught) {
      setDatasetError(caught instanceof Error ? caught.message : "Could not import this dataset.");
    } finally {
      event.target.value = "";
    }
  }

  function exportDataset() {
    if (!dataset.length) return;
    const headers = ["keyword", "url", "domain", "title", "description", "rank", "source", "source_date", "imported_at"];
    const rows = dataset.map((item) => [item.keyword, item.url, item.domain, item.title, item.description, item.rank ?? "", item.source, item.sourceDate ?? "", item.importedAt]);
    const csv = [headers, ...rows].map((row) => row.map((value) => {
      const cell = String(value ?? "");
      const safe = /^[\s]*[=+@\-\t\r]/.test(cell) ? "'" + cell : cell;
      return '"' + safe.replace(/"/g, '""') + '"';
    }).join(",")).join("\r\n");
    downloadCsv("shopes-imported-serp-data.csv", csv);
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <nav className={styles.back} aria-label="Main navigation">
        <Link href="/dashboard">{t("dashboard")}</Link><Link href="/audit">Site Audit</Link><Link href="/keyword-research" aria-current="page">Keyword Research</Link><Link href="/product-intelligence">Product Analysis</Link><Link href="/">Home</Link>
      </nav>
      <div className={styles.headerActions}>
        <span className={styles.free}>{t("freeForever").toUpperCase()}</span>
        <UserMenu name={userName} email={userEmail} image={userImage} signOutAction={signOutAction} />
      </div>
    </header>

    <section className={styles.intro}>
      <div className={styles.eyebrow}><Sparkles size={14} /> INDEPENDENT KEYWORD ENGINE</div>
      <h1>Find your next <span>keyword opportunity.</span></h1>
      <p>Discover related phrases with a deterministic local engine. Shopes does not call external SEO APIs, and it never invents verified search volume, keyword difficulty, or live rankings. CPC is shown only as a low-confidence, rule-based estimate—not observed advertising data.</p>
    </section>

    <form className={styles.searchForm} onSubmit={generate}>
      <label className={styles.seedLabel} htmlFor="seed">{t("seedKeyword")}</label>
      <div className={styles.searchRow}>
        <Search size={19} />
        <input id="seed" value={seed} onChange={(event) => setSeed(event.target.value)} placeholder={language === "Georgian" ? "მაგ. ონლაინ მაღაზია" : "e.g. organic dog food"} required maxLength={120} aria-describedby="seed-help" />
        <button type="submit"><Sparkles size={16} /> {t("generateIdeas")}</button>
      </div>
      <p id="seed-help" className={styles.fieldHelp}>Maximum 120 characters. Results are generated locally from language rules.</p>
      <div className={styles.selectRow}>
        <label>{t("targetMarket")}<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="US">United States</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="AU">Australia</option><option value="GE">Georgia</option><option value="GLOBAL">Global</option></select></label>
        <label>{t("keywordLanguage")}<select value={language} onChange={(event) => { setLanguage(event.target.value as KeywordLanguage); setLanguageNotice(""); setPage(1); setSelected([]); }}>{SUPPORTED_KEYWORD_LANGUAGES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      {languageNotice && <p className={styles.fieldHelp} role="status">{languageNotice}</p>}
      <p className={styles.fieldHelp}>Language rules are local heuristics with limited linguistic coverage; review generated phrases before using them.</p>
      {error && <p className={styles.errorMessage} role="alert">{error}</p>}
    </form>

    <section className={styles.results} aria-live="polite">
      <div className={styles.resultsHead}>
        <div><h2>{t("keywordResearch")}</h2><p>{generated ? (filtered.length + " suggestions · " + country + " · " + language) : "Start with a seed keyword to generate related ideas."}</p></div>
        <div className={styles.actionGroup}><button className={styles.export} onClick={saveKeywordSet} disabled={!generated}><Save size={15} /> {t("saveSetLocally")}</button><button className={styles.export} onClick={exportCsv} disabled={!generated}><Download size={15} /> {t("exportCsv")}</button></div>
      </div>
      {saveMessage && <p className={styles.fieldHelp} role="status">{saveMessage}</p>}
      <div className={styles.sourceNote}><Target size={17} /><div><strong>Source: Shopes local algorithms</strong><p>Opportunity and relevance are transparent heuristics. Modelled CPC is a broad, low-confidence range based on estimated intent—not Google Ads bids or measured keyword data. Verified search volume, competition metrics, and live SERP data are unavailable unless you import a dataset.</p></div></div>

      {generated && language === "English" && <section className={styles.sourceNote} aria-labelledby="smollm2-intent-title"><div><strong id="smollm2-intent-title">Optional AI intent grouping (Preview)</strong><p>Group up to 30 generated phrases with SmolLM2. This experimental feature is off unless explicitly enabled for Preview; local keyword results remain available.</p><button type="button" className={styles.export} onClick={runAiIntentGrouping} disabled={aiIntentLoading || allIdeas.length === 0}>{aiIntentLoading ? "Analyzing…" : "Group first 30 keywords with AI"}</button>{aiIntentError && <p className={styles.errorMessage} role="alert">{aiIntentError}</p>}{aiIntentResult && <div role="status"><p><strong>{aiIntentResult.label}</strong></p><p>{aiIntentResult.metrics}</p>{aiIntentResult.groups.map((group, index) => <p key={group.label + index}><strong>{group.label} · {group.intent}</strong>: {group.keywords.join(", ")}</p>)}{aiIntentResult.recommendations.length > 0 && <><strong>AI recommendations</strong><ul>{aiIntentResult.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></>}</div>}</div></section>}

      {generated && <div className={styles.filters}>
        <label className={styles.filterSearch}><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Filter keyword ideas" /></label>
        <label className={styles.filterSelect}>Intent<select value={intent} onChange={(event) => { setIntent(event.target.value as "All" | SearchIntent); setPage(1); }}>{INTENTS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className={styles.filterSelect}>Topic<select value={cluster} onChange={(event) => { setCluster(event.target.value); setPage(1); }}><option value="All">All topics</option>{Array.from(new Set(allIdeas.map((item) => item.cluster))).sort().map((item) => <option key={item}>{item}</option>)}</select></label>
        <button type="button" className={styles.sort} onClick={() => setSort(sort === "opportunity" ? "phrase" : sort === "phrase" ? "intent" : "opportunity")}><ArrowDownUp size={15} /> Sort: {sort === "opportunity" ? "Opportunity" : sort === "phrase" ? "Keyword" : "Intent"}</button>
      </div>}

      {!generated ? <div className={styles.empty}><div><Search size={24} /></div><h3>Your keyword list starts here</h3><p>Enter a seed phrase above. Shopes will generate deterministic keyword ideas in your browser without external API calls.</p></div> : filtered.length === 0 ? <div className={styles.empty}><h3>No matching ideas</h3><p>Try another filter or seed keyword.</p></div> : <>
        <div className={styles.tableWrap}><table><thead><tr>
          <th><input aria-label="Select all visible keywords" type="checkbox" checked={visible.length > 0 && visible.every((item) => selected.includes(item.normalized))} onChange={(event) => setSelected(event.target.checked ? Array.from(new Set([...selected, ...visible.map((item) => item.normalized)])) : selected.filter((phrase) => !visible.some((item) => item.normalized === phrase)))} /></th>
          <th>Keyword</th><th>Type</th><th>Intent</th><th>Words</th><th>Opportunity</th><th>Modelled CPC (USD)</th><th>Verified metrics</th>
        </tr></thead><tbody>{visible.map((item: KeywordIdea) => <tr key={item.normalized}>
          <td><input type="checkbox" aria-label={"Select " + item.phrase} checked={selected.includes(item.normalized)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.normalized] : selected.filter((phrase) => phrase !== item.normalized))} /></td>
          <td className={styles.keyword}>{item.phrase}{item.longTail && <span className={styles.longTail}>LONG-TAIL</span>}</td>
          <td>{item.kind}</td><td><span className={styles.intent}>{item.intent}</span></td><td>{item.wordCount}</td>
          <td><span className={styles.score}>{item.opportunityScore}</span><small className={styles.scoreLabel}>heuristic / 100</small></td>
          <td><span className={styles.cpcEstimate}>${item.estimatedCpcLowUsd.toFixed(2)}–${item.estimatedCpcHighUsd.toFixed(2)}</span><small className={styles.scoreLabel}>low confidence</small></td>
          <td><span className={styles.unavailable}>Not available</span></td>
        </tr>)}</tbody></table></div>
        <div className={styles.tableFooter}><span>{selected.length ? (selected.length + " selected · ") : ""}Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div></div>
      </>}
    </section>

    <section className={styles.results} aria-labelledby="serp-import-title">
      <div className={styles.resultsHead}><div><h2 id="serp-import-title">Analyze your own SERP dataset</h2><p>Import legitimate search-result data that you already have permission to use.</p></div>{dataset.length > 0 && <button className={styles.export} onClick={exportDataset}><Download size={15} /> Export dataset</button>}</div>
      <div className={styles.sourceNote}><FileUp size={17} /><div><strong>Local import only · No scraping or network requests</strong><p>Accepted formats: CSV or JSON, up to 2 MB and 5,000 valid rows. Include keyword/query and URL/link fields; optional columns include title, description/snippet, and rank/position.</p></div></div>
      <label className={styles.importButton}><Upload size={16} /> Choose CSV or JSON file<input type="file" accept=".csv,.json,text/csv,application/json" onChange={importDataset} /></label>
      {datasetError && <p className={styles.errorMessage} role="alert">{datasetError}</p>}
      {dataset.length > 0 && <div className={styles.importSummary}>
        <div><strong>{importedCount.toLocaleString()} rows imported</strong><p>File: {datasetName}. Source filename and import time are attached to each record; source dates are retained when present in the file. These records are not independently verified as live search results.</p></div>
        <button type="button" className={styles.clearButton} onClick={() => { setDataset([]); setDatasetName(""); setImportedCount(0); setDatasetError(""); }}><X size={15} /> Clear</button>
        <h3>Domains appearing most often across imported results</h3>
        <div className={styles.tableWrap}><table><thead><tr><th>Domain</th><th>Occurrences</th><th>Keyword overlap</th><th>Average rank</th></tr></thead><tbody>{domainOverlap.slice(0, 20).map((item) => <tr key={item.domain}><td className={styles.keyword}>{item.domain}</td><td>{item.occurrences}</td><td>{item.keywords.length}</td><td>{item.averageRank ?? "Not supplied"}</td></tr>)}</tbody></table></div>
      </div>}
    </section>

    <details className={styles.methodology}>
      <summary>Scoring methodology and limitations</summary>
      <p><strong>Specificity (0–100):</strong> based on word count (up to 65 points), phrase length (up to 20 points), and a small modifier for numeric tokens. It does not estimate search demand.</p>
      <p><strong>Relevance (0–100):</strong> based on overlap between seed tokens and candidate phrase tokens, with a bonus when the normalized phrase contains the seed.</p>
      <p><strong>Shopes Opportunity Score (0–100):</strong> round(0.45 × specificity + 0.40 × relevance + intent bonus). Intent bonuses are informational 8, commercial 12, transactional 10, local 7, navigational 0, unclassified 3; capped at 100. This is a prioritization heuristic, not a ranking probability or Keyword Difficulty score.</p>
      <p><strong>Data provenance:</strong> generated phrases are labelled locally generated; imported rows retain their file label and import timestamp. Importing a dataset does not verify its origin or make it live Google data.</p>
      <p><strong>Modelled CPC (USD):</strong> broad intent-based ranges (informational $0.05–$1.25; commercial $0.25–$2.75; transactional $0.35–$3.50; local $0.20–$2.50; navigational $0.05–$1.50; unclassified $0.05–$1.75). These ranges are uncalibrated, low-confidence placeholders—not market observations or predictions. They do not vary by country or niche. <strong>Unavailable without verified sources:</strong> monthly search volume, measured CPC, organic keyword difficulty, live rankings, and historical trends. Market selection is metadata only and does not imply market-specific search metrics.</p>
    </details>

    <footer className={styles.footer}>Shopes is free to use. No external keyword API, database, paid provider, or automatic search-engine scraping is used.</footer>
  </main>;
}
