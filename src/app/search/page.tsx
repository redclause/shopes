import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Search, ShoppingBag, Store } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Search online stores",
  description: "Search for online stores and shopping websites with Shopes.",
  alternates: { canonical: "/search" },
};

// Google Programmable Search Engine IDs are public identifiers, not credentials.
// Allow deployment configuration to override the provided default.
const DEFAULT_GOOGLE_CSE_ID = "e2dc391aa286b4b8d";

export default function StoreSearchPage() {
  const searchEngineId =
    process.env.NEXT_PUBLIC_GOOGLE_CSE_ID?.trim() || DEFAULT_GOOGLE_CSE_ID;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Shopes home">
          <span className={styles.brandMark}><ShoppingBag size={18} /></span>
          <span>shopes<span className={styles.brandDot}>.</span></span>
        </Link>
        <Link className={styles.backLink} href="/"><ArrowLeft size={15} /> Back to home</Link>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}><Store size={14} /> SHOPPING WEB SEARCH</span>
        <h1>Find online stores.<br /><span>Discover what you need.</span></h1>
        <p>Search for shopping websites and online stores using Shopes.</p>
      </section>

      <section className={styles.searchPanel} aria-label="Online store search">
        <Script
          id="shopes-google-programmable-search"
          src={`https://cse.google.com/cse.js?cx=${encodeURIComponent(searchEngineId)}`}
          strategy="afterInteractive"
        />
        <div className="gcse-search" />
        <noscript>Enable JavaScript to use the online store search.</noscript>
      </section>

      <footer className={styles.footer}>
        Search results are supplied by Google Programmable Search. Availability and coverage depend on the configured search engine.
      </footer>
    </main>
  );
}
