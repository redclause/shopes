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

export default function StoreSearchPage() {
  const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID?.trim();

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
        {searchEngineId ? (
          <>
            <Script
              id="shopes-google-programmable-search"
              src={`https://cse.google.com/cse.js?cx=${encodeURIComponent(searchEngineId)}`}
              strategy="afterInteractive"
            />
            <div className="gcse-search" />
            <noscript>Enable JavaScript to use the online store search.</noscript>
          </>
        ) : (
          <div className={styles.setupNotice} role="status">
            <span className={styles.searchIcon}><Search size={20} /></span>
            <h2>Search is not connected yet</h2>
            <p>
              Shopes does not have a Google Programmable Search Engine ID configured in this deployment.
              Search results are unavailable until the existing search engine is connected.
            </p>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        Search results are supplied by Google Programmable Search. Availability and coverage depend on the configured search engine.
      </footer>
    </main>
  );
}
