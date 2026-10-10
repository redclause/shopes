import styles from "./page.module.css";

export default function DashboardLoading() {
  return <main className={styles.app} aria-busy="true" aria-live="polite">
    <aside className={styles.sidebar} aria-hidden="true"><div className={styles.brand}><span className={styles.brandMark}>S</span><span>shopes<span className={styles.brandDot}>.</span></span></div><div className={styles.skeletonBlock}/><div className={styles.skeletonBlock}/><div className={styles.skeletonBlock}/></aside>
    <section className={styles.mainPanel}><header className={styles.topbar}><span className={styles.skeletonLine}/></header><div className={styles.content}><span className={styles.skeletonLine}/><div className={styles.loadingHero}/><div className={styles.summaryGrid}><div className={styles.loadingCard}/><div className={styles.loadingCard}/><div className={styles.loadingCard}/></div></div></section>
    <span className={styles.srOnly}>Loading dashboard preview…</span>
  </main>;
}
