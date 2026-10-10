import styles from "./page.module.css";

export default function DashboardLoading() {
  return (
    <main className={styles.shell} aria-busy="true" aria-live="polite">
      <aside className={styles.sidebar} aria-hidden="true">
        <div className={styles.brand}><span className={styles.brandMark}>S</span><span>shopes<span className={styles.brandDot}>.</span></span></div>
      </aside>
      <section className={styles.mainPanel}>
        <header className={styles.topbar}><span className={styles.breadcrumb}>Loading workspace…</span></header>
        <div className={styles.content}>
          <div className={styles.welcome}><div><div className={styles.eyebrow}>YOUR SHOPES WORKSPACE</div><h1>Preparing your dashboard</h1></div></div>
          <div className={styles.emptyState}><p>Loading your account and workspace…</p></div>
        </div>
      </section>
    </main>
  );
}
