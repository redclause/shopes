"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownUp, ArrowLeft, Download, Search, Sparkles, Target } from "lucide-react";
import styles from "./page.module.css";

type Keyword = { phrase: string; kind: string; intent: string };

const modifiers = [
  { text: "best", kind: "Commercial" }, { text: "top", kind: "Commercial" },
  { text: "affordable", kind: "Commercial" }, { text: "buy", kind: "Transactional" },
  { text: "price", kind: "Transactional" }, { text: "reviews", kind: "Commercial" },
  { text: "how to choose", kind: "Informational" }, { text: "how to use", kind: "Informational" },
  { text: "what is", kind: "Informational" }, { text: "ideas", kind: "Informational" },
  { text: "for beginners", kind: "Informational" }, { text: "near me", kind: "Local" },
  { text: "online", kind: "Transactional" }, { text: "alternatives", kind: "Commercial" },
  { text: "vs", kind: "Commercial" }, { text: "checklist", kind: "Informational" },
];

function buildIdeas(seed: string): Keyword[] {
  const clean = seed.trim().replace(/\s+/g, " ");
  if (!clean) return [];
  const ideas: Keyword[] = [{ phrase: clean, kind: "Seed keyword", intent: "Unclassified" }];
  for (const item of modifiers) {
    ideas.push({ phrase: `${item.text} ${clean}`, kind: "Modifier variation", intent: item.kind });
    if (["best", "top", "affordable", "buy", "price", "reviews", "online", "alternatives"].includes(item.text)) {
      ideas.push({ phrase: `${clean} ${item.text}`, kind: "Word-order variation", intent: item.kind });
    }
  }
  const words = clean.split(" ");
  if (words.length > 1) {
    ideas.push({ phrase: words.slice(0, -1).join(" "), kind: "Short-tail variation", intent: "Unclassified" });
    ideas.push({ phrase: words.slice(1).join(" "), kind: "Short-tail variation", intent: "Unclassified" });
  }
  ideas.push({ phrase: `${clean} guide`, kind: "Topic variation", intent: "Informational" });
  ideas.push({ phrase: `${clean} tips`, kind: "Topic variation", intent: "Informational" });
  return Array.from(new Map(ideas.filter((item) => item.phrase.trim()).map((item) => [item.phrase.toLowerCase(), item])).values());
}

export default function KeywordResearchClient() {
  const [seed, setSeed] = useState("");
  const [country, setCountry] = useState("US");
  const [language, setLanguage] = useState("English");
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState("All");
  const [sort, setSort] = useState("phrase");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const pageSize = 10;

  const allIdeas = useMemo(() => generated ? buildIdeas(seed) : [], [generated, seed]);
  const filtered = useMemo(() => allIdeas
    .filter((item) => item.phrase.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => intent === "All" || item.intent === intent)
    .sort((a, b) => sort === "intent" ? a.intent.localeCompare(b.intent) || a.phrase.localeCompare(b.phrase) : a.phrase.localeCompare(b.phrase)), [allIdeas, query, intent, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seed.trim()) return;
    setSeed(seed.trim().replace(/\s+/g, " "));
    setGenerated(true);
    setPage(1);
    setSelected([]);
  }

  function exportCsv() {
    const rows = [["Keyword", "Variation type", "Intent", "Country", "Language", "Metric status"],
      ...allIdeas.filter((item) => selected.length === 0 || selected.includes(item.phrase)).map((item) => [item.phrase, item.kind, item.intent, country, language, "Not provided — local suggestions only"])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shopes-keyword-ideas.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.back}><ArrowLeft size={16} /> Dashboard</Link>
      <span className={styles.free}>FREE WORKSPACE</span>
    </header>
    <section className={styles.intro}>
      <div className={styles.eyebrow}><Sparkles size={14} /> KEYWORD DISCOVERY</div>
      <h1>Find your next <span>keyword opportunity.</span></h1>
      <p>Explore related phrases, long-tail variations, and potential search intent. No paid data provider is connected, so these are locally generated ideas—not verified search-volume metrics.</p>
    </section>
    <form className={styles.searchForm} onSubmit={generate}>
      <label className={styles.seedLabel} htmlFor="seed">Seed keyword or topic</label>
      <div className={styles.searchRow}><Search size={19} /><input id="seed" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="e.g. organic dog food" required maxLength={120} /><button type="submit"><Sparkles size={16} /> Generate ideas</button></div>
      <div className={styles.selectRow}>
        <label>Target market<select value={country} onChange={(e) => setCountry(e.target.value)}><option value="US">United States</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="AU">Australia</option><option value="GE">Georgia</option><option value="GLOBAL">Global</option></select></label>
        <label>Language<select value={language} onChange={(e) => setLanguage(e.target.value)}><option>English</option><option>Georgian</option><option>Spanish</option><option>French</option><option>German</option></select></label>
      </div>
    </form>
    <section className={styles.results} aria-live="polite">
      <div className={styles.resultsHead}><div><h2>Keyword ideas</h2><p>{generated ? `${filtered.length} suggestions · ${country} · ${language}` : "Start with a seed keyword to generate related ideas."}</p></div><button className={styles.export} onClick={exportCsv} disabled={!generated}><Download size={15} /> Export CSV</button></div>
      <div className={styles.sourceNote}><Target size={17} /><div><strong>Source: local keyword expansion</strong><p>Generated from phrase modifiers and word-order variations. Search volume, CPC, keyword difficulty, and live Google metrics are not available in this mode.</p></div></div>
      {generated && <div className={styles.filters}><label className={styles.filterSearch}> <Search size={15} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Filter keyword ideas" /></label><label className={styles.filterSelect}>Intent<select value={intent} onChange={(e) => { setIntent(e.target.value); setPage(1); }}><option>All</option><option>Informational</option><option>Commercial</option><option>Transactional</option><option>Local</option><option>Unclassified</option></select></label><button className={styles.sort} onClick={() => setSort(sort === "phrase" ? "intent" : "phrase")}><ArrowDownUp size={15} /> Sort: {sort === "phrase" ? "Keyword" : "Intent"}</button></div>}
      {!generated ? <div className={styles.empty}><div><Search size={24} /></div><h3>Your keyword list starts here</h3><p>Enter a seed phrase above. Shopes will create transparent, editable keyword ideas without inventing search metrics.</p></div> : filtered.length === 0 ? <div className={styles.empty}><h3>No matching ideas</h3><p>Try a different filter or seed keyword.</p></div> : <>
        <div className={styles.tableWrap}><table><thead><tr><th><input aria-label="Select all visible keywords" type="checkbox" checked={visible.length > 0 && visible.every((item) => selected.includes(item.phrase))} onChange={(e) => setSelected(e.target.checked ? Array.from(new Set([...selected, ...visible.map((item) => item.phrase)])) : selected.filter((phrase) => !visible.some((item) => item.phrase === phrase))} /></th><th>Keyword</th><th>Type</th><th>Intent</th><th>Volume</th><th>Difficulty</th></tr></thead><tbody>{visible.map((item) => <tr key={item.phrase}><td><input type="checkbox" aria-label={`Select ${item.phrase}`} checked={selected.includes(item.phrase)} onChange={(e) => setSelected(e.target.checked ? [...selected, item.phrase] : selected.filter((phrase) => phrase !== item.phrase))} /></td><td className={styles.keyword}>{item.phrase}</td><td>{item.kind}</td><td><span className={styles.intent}>{item.intent}</span></td><td><span className={styles.unavailable}>—</span></td><td><span className={styles.unavailable}>—</span></td></tr>)}</tbody></table></div>
        <div className={styles.tableFooter}><span>{selected.length ? `${selected.length} selected · ` : ""}Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div></div>
      </>}
    </section>
    <footer className={styles.footer}>Shopes is free to use. Keyword metrics require a verified data source; no search-volume or difficulty figures are fabricated.</footer>
  </main>;
}
