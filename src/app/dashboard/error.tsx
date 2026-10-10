"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import styles from "./page.module.css";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Dashboard preview failed to render", error); }, [error]);
  return <main className={styles.errorPage}><div className={styles.errorCard}><span className={styles.errorIcon}><AlertTriangle size={22}/></span><h1>We couldn’t load this view.</h1><p>The dashboard preview ran into an unexpected issue. Your project data has not been changed.</p><button className={styles.primaryButton} onClick={() => reset()}><RefreshCw size={16}/> Try again</button></div></main>;
}
