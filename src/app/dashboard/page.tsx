import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  FileSearch,
  Globe2,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
} from "lucide-react";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fdashboard");
  }

  const user = session.user;
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Shopes user";
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand} aria-label="Shopes home">
          <span className={styles.brandMark}><ShoppingBag size={18} /></span>
          <span>shopes<span className={styles.brandDot}>.</span></span>
        </Link>

        <div className={styles.workspaceLabel}>WORKSPACE</div>
        <div className={styles.workspaceCard}>
          <span className={styles.workspaceIcon}><Globe2 size={17} /></span>
          <span className={styles.workspaceCopy}><strong>My workspace</strong><small>Personal workspace</small></span>
          <span className={styles.freeBadge}>FREE</span>
        </div>

        <nav className={styles.navigation} aria-label="Workspace navigation">
          <span className={styles.navLabel}>OVERVIEW</span>
          <a className={styles.navItemActive} href="#overview" aria-current="page"><LayoutDashboard size={17} /> Dashboard</a>
          <a className={styles.navItem} href="#projects"><Globe2 size={17} /> Projects <span className={styles.navCount}>0</span></a>
          <a className={styles.navItem} href="/audit"><FileSearch size={17} /> Site audits</a>
          <Link className={styles.navItem} href="/keyword-research"><Target size={17} /> Keyword research</Link>
          <span className={styles.navLabel}>SHOPES</span>
          <Link className={styles.navItem} href="/#platform"><Target size={17} /> Explore platform <ArrowUpRight size={14} /></Link>
          <Link className={styles.navItem} href="/#platform"><Sparkles size={17} /> Explore Shopes <ArrowUpRight size={14} /></Link>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.helpCard}>
            <span className={styles.helpIcon}><CircleHelp size={17} /></span>
            <strong>Getting started</strong>
            <p>Explore what Shopes can do while project storage and live audits are being built.</p>
            <Link href="/#features">Explore features <ArrowRight size={14} /></Link>
          </div>

          <div className={styles.account}>
            <span className={styles.avatar} aria-hidden="true">{initials}</span>
            <span className={styles.accountText}><strong>{displayName}</strong><small>{user.email || "Google account"}</small></span>
            <form action={signOutAction}>
              <button className={styles.signOut} type="submit" aria-label="Sign out of Shopes" title="Sign out"><LogOut size={16} /></button>
            </form>
          </div>
        </div>
      </aside>

      <section className={styles.mainPanel} id="overview">
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>Workspace</span><span aria-hidden="true">/</span><strong>Dashboard</strong></div>
          <div className={styles.topbarRight}>
            <span className={styles.sessionBadge}><span /> Signed in securely</span>
            <span className={styles.avatarSmall} aria-hidden="true">{initials}</span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcome}>
            <div>
              <div className={styles.eyebrow}><Sparkles size={14} /> YOUR SHOPES WORKSPACE</div>
              <h1>Welcome back{user.name ? `, ${user.name.trim().split(/\s+/)[0]}` : ""}.</h1>
              <p>Build a clearer picture of your store’s search visibility, one step at a time.</p>
            </div>
            <div className={styles.welcomeActions}><Link className={styles.primaryButton} href="/audit"><ArrowRight size={16} /> Run an audit</Link><Link className={styles.secondaryButton} href="/keyword-research"><Target size={16} /> Keyword research</Link></div>
          </div>

          <div className={styles.notice} role="note">
            <span className={styles.noticeIcon}><ShieldCheck size={18} /></span>
            <div><strong>Your workspace is ready</strong><p>Google sign-in is connected. Website projects and live SEO data are not available yet, so this dashboard shows no fabricated metrics.</p></div>
            <span className={styles.noticeStatus}><CheckCircle2 size={14} /> Account connected</span>
          </div>

          <section className={styles.section} id="projects" aria-labelledby="projects-title">
            <div className={styles.sectionHeading}>
              <div><h2 id="projects-title">Your projects</h2><p>Websites you choose to monitor will appear here.</p></div>
              <span className={styles.countBadge}>0 projects</span>
            </div>
            <div className={styles.emptyState}>
              <div className={styles.emptyArtwork} aria-hidden="true">
                <span className={styles.orbit} />
                <span className={styles.globeCard}><Globe2 size={28} /></span>
                <span className={styles.sparkleCard}><Sparkles size={16} /></span>
              </div>
              <div className={styles.emptyCopy}>
                <span className={styles.kicker}>A CLEAR PLACE TO BEGIN</span>
                <h3>Your first project is the next step.</h3>
                <p>Project saving is not connected yet. When it is available, you’ll be able to add a store and keep its audit history in one place.</p>
                <Link className={styles.secondaryButton} href="/#get-started">Explore the store workflow <ArrowRight size={15} /></Link>
              </div>
            </div>
          </section>

          <section className={styles.section} id="audits" aria-labelledby="activity-title">
            <div className={styles.sectionHeading}>
              <div><h2 id="activity-title">Workspace overview</h2><p>Live results will appear after the required services are connected.</p></div>
              <span className={styles.countBadge}>No saved history</span>
              <Link className={styles.secondaryButton} href="/audit"><FileSearch size={15} /> Run a technical audit <ArrowRight size={15} /></Link>
            </div>
            <div className={styles.metricGrid}>
              <article className={styles.metricCard}><span className={styles.metricIcon}><Activity size={18} /></span><span className={styles.metricLabel}>AUDITS COMPLETED</span><strong>—</strong><p>No audits have run yet.</p></article>
              <article className={styles.metricCard}><span className={styles.metricIcon}><Target size={18} /></span><span className={styles.metricLabel}>SEO OPPORTUNITIES</span><strong>—</strong><p>Insights require real audit data.</p></article>
              <article className={styles.metricCard}><span className={styles.metricIcon}><FileSearch size={18} /></span><span className={styles.metricLabel}>ISSUES TO REVIEW</span><strong>—</strong><p>Website crawling is not connected.</p></article>
            </div>
          </section>

          <section className={styles.accountPanel} aria-labelledby="account-title">
            <div className={styles.accountPanelIcon}><Settings2 size={18} /></div>
            <div className={styles.accountPanelCopy}><h2 id="account-title">Your account</h2><p>{user.email || "Google account"} · Signed in with Google. Dedicated account settings are planned for the next phase.</p></div>
            <form action={signOutAction}><button className={styles.secondaryButton} type="submit"><LogOut size={15} /> Sign out</button></form>
          </section>

          <footer className={styles.footer}><span>© {new Date().getFullYear()} Shopes</span><span>Always free · No credit card required</span></footer>
        </div>
      </section>
    </main>
  );
}
