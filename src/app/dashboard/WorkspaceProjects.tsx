"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Download, Globe2, Plus, Trash2 } from "lucide-react";
import styles from "./WorkspaceProjects.module.css";

type Project = { id: string; name: string; url: string; market: string; language: string; createdAt: string };
type SavedAudit = { url?: string; checkedAt?: string; savedAt?: string; status?: number; summary?: { errors?: number; warnings?: number }; findings?: unknown[] };

const PROJECTS_KEY = "shopes:projects:v1";
const AUDITS_KEY = "shopes:audit-history:v1";

function safeRead<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value as T[] : [];
  } catch { return []; }
}

export default function WorkspaceProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [market, setMarket] = useState("US");
  const [language, setLanguage] = useState("English");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setProjects(safeRead<Project>(PROJECTS_KEY));
    setAudits(safeRead<SavedAudit>(AUDITS_KEY));
  }, []);

  function persist(next: Project[]) {
    setProjects(next);
    try {
      window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
      setMessage("Saved in this browser only; projects do not sync across devices.");
    } catch {
      setMessage("Browser storage is unavailable or full. Changes may not persist.");
    }
  }

  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    let parsed: URL;
    try {
      parsed = new URL(url.trim().includes("://") ? url.trim() : "https://" + url.trim());
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) throw new Error();
    } catch {
      setMessage("Enter a valid public website URL, such as https://example.com.");
      return;
    }
    if (!cleanName) return;
    const project: Project = { id: crypto.randomUUID(), name: cleanName.slice(0, 80), url: parsed.origin, market, language, createdAt: new Date().toISOString() };
    persist([project, ...projects].slice(0, 100));
    setName("");
    setUrl("");
  }

  function removeProject(id: string) {
    persist(projects.filter((project) => project.id !== id));
  }

  function downloadAudit(audit: SavedAudit) {
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "shopes-audit-report.json";
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.panel}>
        <div className={styles.panelHead}><div><h3>Add a project</h3><p>Organize websites locally without connecting a database.</p></div><span>{projects.length} / 100</span></div>
        <form className={styles.form} onSubmit={addProject}>
          <label>Project name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="My online store" required /></label>
          <label>Website URL<input value={url} onChange={(event) => setUrl(event.target.value)} maxLength={2048} inputMode="url" placeholder="https://example.com" required /></label>
          <div className={styles.selects}>
            <label>Target market<select value={market} onChange={(event) => setMarket(event.target.value)}><option value="US">United States</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="AU">Australia</option><option value="GE">Georgia</option><option value="GLOBAL">Global</option></select></label>
            <label>Research language<select value={language} onChange={(event) => setLanguage(event.target.value)}>{["English","Spanish","French","German","Portuguese","Italian","Dutch","Russian","Ukrainian","Turkish","Arabic","Hindi","Chinese","Japanese","Korean","Indonesian","Vietnamese","Polish","Swedish","Georgian"].map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <button type="submit" disabled={projects.length >= 100}><Plus size={16} /> Add project</button>
        </form>
        {message && <p className={styles.message} role="status">{message}</p>}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}><div><h3>Your projects</h3><p>Saved in this browser, not on a server.</p></div><span>{projects.length} projects</span></div>
        {projects.length === 0 ? <div className={styles.empty}><Globe2 size={24} /><strong>No projects yet</strong><p>Add a website above to keep its target market and language together.</p></div> : <ul className={styles.projectList}>{projects.map((project) => <li key={project.id}><span className={styles.projectIcon}><Globe2 size={17} /></span><div className={styles.projectCopy}><strong>{project.name}</strong><a href={project.url} target="_blank" rel="noreferrer">{project.url}</a><small>{project.market} · {project.language}</small></div><button className={styles.iconButton} type="button" onClick={() => removeProject(project.id)} aria-label={"Delete " + project.name} title="Delete project"><Trash2 size={16} /></button></li>)}</ul>}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}><div><h3>Saved audit reports</h3><p>Reports saved from the Technical SEO Audit on this browser.</p></div><span>{audits.length} reports</span></div>
        {audits.length === 0 ? <div className={styles.empty}><strong>No saved reports</strong><p>Run an audit and choose “Save in this browser” to keep a local snapshot.</p></div> : <ul className={styles.auditList}>{audits.slice(0, 10).map((audit, index) => <li key={(audit.checkedAt || "") + index}><div><strong>{audit.url || "Website audit"}</strong><small>{audit.savedAt ? new Date(audit.savedAt).toLocaleString() : audit.checkedAt ? new Date(audit.checkedAt).toLocaleString() : "Saved report"} · {audit.summary?.errors ?? 0} errors · {audit.summary?.warnings ?? 0} warnings</small></div><button type="button" onClick={() => downloadAudit(audit)}><Download size={15} /> Export</button></li>)}</ul>}
        <p className={styles.storageNote}>Browser-local data may be lost if browser data is cleared. It does not sync across devices or users. No credentials are stored here.</p>
      </div>
    </div>
  );
}
