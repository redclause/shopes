"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check,
  ChevronDown, CircleHelp, Clock3, ExternalLink, FileSearch,
  Globe2, LayoutDashboard, LifeBuoy, Menu, Plus, Search,
  ShieldCheck, ShoppingBag, Sparkles, Target, TrendingUp, X, Zap
} from "lucide-react";
import styles from "./page.module.css";
import SignOutButton from "@/components/sign-out-button";

const sampleActivity = [
  { icon: FileSearch, tone: "mint", title: "Technical audit completed", detail: "northstar.store · Example activity", time: "2 hours ago" },
  { icon: Target, tone: "lavender", title: "Keyword workspace prepared", detail: "Demo data · No live provider connected", time: "Yesterday" },
  { icon: Globe2, tone: "peach", title: "Project setup checklist updated", detail: "Illustrative event", time: "Oct 7" },
];

export default function DashboardPage() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [previewedHosts, setPreviewedHosts] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = siteUrl.trim();
    try {
      const parsed = new URL(value.includes("://") ? value : "https://" + value);
      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        !parsed.hostname.includes(".") ||
        parsed.username ||
        parsed.password
      ) {
        throw new Error("Invalid website URL");
      }
      const normalizedHost = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (previewedHosts.includes(normalizedHost)) {
        setFeedback("This website has already been previewed in this session. No project was saved.");
        setShowProjectForm(false);
        return;
      }
      setPreviewedHosts((hosts) => [...hosts, normalizedHost]);
      setFeedback("Preview only: " + (projectName.trim() || parsed.hostname) + " is not saved. Project persistence will be added in a later phase.");
      setShowProjectForm(false);
    } catch {
      setFeedback("Enter a valid website address, such as yourstore.com.");
    }
  }

  return (
    <main className={styles.app}>
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/" className={styles.brand} aria-label="Shopes home">
          <span className={styles.brandMark}><ShoppingBag size={18} strokeWidth={2.1} /></span>
          <span>shopes<span className={styles.brandDot}>.</span></span>
        </Link>
        <div className={styles.workspaceLabel}>WORKSPACE</div>
        <button className={styles.workspacePicker} type="button" aria-label="Workspace selector (demo)">
          <span className={styles.workspaceAvatar}>S</span>
          <span className={styles.workspaceText}><strong>My workspace</strong><small>Free plan · Preview</small></span>
          <ChevronDown size={15} />
        </button>
        <nav className={styles.navigation} aria-label="Main navigation">
          <span className={styles.navSection}>OVERVIEW</span>
          <Link className={`${styles.navItem} ${styles.navActive}`} href="#overview" aria-current="page"><LayoutDashboard size={17}/> Dashboard</Link>
          <Link className={styles.navItem} href="#projects"><Globe2 size={17}/> Projects <span className={styles.navCount}>0</span></Link>
          <Link className={styles.navItem} href="#audits"><FileSearch size={17}/> Site audits</Link>
          <Link className={styles.navItem} href="/#platform"><TrendingUp size={17}/> SEO insights <ExternalLink size={12} className={styles.external}/></Link>
          <span className={styles.navSection}>WORKSPACE</span>
          <Link className={styles.navItem} href="/#integrations"><Zap size={17}/> Integrations <ExternalLink size={12} className={styles.external}/></Link>
          <Link className={styles.navItem} href="/#pricing"><Sparkles size={17}/> Plans & pricing <ExternalLink size={12} className={styles.external}/></Link>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.helpCard}>
            <span className={styles.helpIcon}><LifeBuoy size={17}/></span>
            <strong>Need a hand?</strong>
            <p>Explore the Shopes platform and what is coming next.</p>
            <Link href="/#platform">Explore platform <ArrowUpRight size={13}/></Link>
          </div>
          <div className={styles.sidebarFoot}>
            <span className={styles.avatar}>G</span>
            <span className={styles.userMeta}><strong>Shopes account</strong><small>Signed-in session</small></span>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button type="button" className={styles.mobileScrim} aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <section className={styles.mainPanel} id="overview">
        <header className={styles.topbar}>
          <button type="button" className={styles.mobileMenu} aria-label="Open navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={20}/></button>
          <div className={styles.breadcrumb}><span>Workspace</span><span className={styles.breadcrumbSlash}>/</span><strong>Dashboard</strong></div>
          <div className={styles.topbarActions}>
            <span className={styles.previewBadge}><span/> Preview environment</span>
            <button type="button" className={styles.iconButton} aria-label="Notifications are not available in preview" title="Notifications are not available in preview"><Bell size={17}/></button>
            <button type="button" className={styles.helpButton} aria-label="Help"><CircleHelp size={17}/></button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcomeRow}>
            <div>
              <div className={styles.eyebrow}><Sparkles size={13}/> YOUR SEO WORKSPACE</div>
              <h1>Good things start <span>with discovery.</span></h1>
              <p className={styles.lead}>Bring your store’s search visibility into focus, one practical step at a time.</p>
            </div>
            <button type="button" className={styles.primaryButton} onClick={() => { setFeedback(""); setShowProjectForm(true); }}><Plus size={17}/> Add project</button>
          </div>

          <div className={styles.notice} role="note">
            <span className={styles.noticeIcon}><ShieldCheck size={17}/></span>
            <div><strong>You’re viewing a product preview</strong><p>Numbers and activity below are illustrative examples. No website has been crawled, and no project or audit data is saved yet.</p></div>
            <span className={styles.demoTag}>DEMO DATA</span>
          </div>

          {feedback && <div className={styles.feedback} role="status"><Check size={16}/><span>{feedback}</span><button type="button" onClick={() => setFeedback("")} aria-label="Dismiss message"><X size={15}/></button></div>}

          <div className={styles.sectionHeading} id="projects">
            <div><h2>Your projects</h2><p>Your websites, audits, and opportunities in one place.</p></div>
            <span className={styles.counter}>0 projects</span>
          </div>

          <section className={styles.emptyCard} aria-labelledby="empty-title">
            <div className={styles.emptyIllustration} aria-hidden="true">
              <div className={styles.orbitOne}/><div className={styles.orbitTwo}/>
              <div className={styles.illustrationCard}><Globe2 size={27}/><span className={styles.illustrationCheck}><Check size={12}/></span></div>
              <span className={styles.floatSpark}><Sparkles size={16}/></span>
              <span className={styles.floatSearch}><Search size={17}/></span>
            </div>
            <div className={styles.emptyCopy}>
              <span className={styles.smallEyebrow}>A CLEAR PLACE TO BEGIN</span>
              <h3 id="empty-title">Your first project starts here.</h3>
              <p>Add your store to prepare a workspace for technical SEO checks, crawl settings, and future audit history. Project creation is currently a preview interaction only.</p>
              <button type="button" className={styles.secondaryButton} onClick={() => { setFeedback(""); setShowProjectForm(true); }}><Plus size={16}/> Add your first project</button>
            </div>
            <div className={styles.emptyFoot}><span><Check size={14}/> Permanent Free plan</span><i/><span>No trial countdown</span><i/><span>No credit card required</span></div>
          </section>

          <div className={styles.summaryGrid} id="audits">
            <article className={styles.summaryCard}>
              <div className={styles.summaryTop}><span className={styles.summaryIcon}><Activity size={17}/></span><span className={styles.summaryLabel}>AUDIT ACTIVITY</span><span className={styles.summaryArrow}><ArrowUpRight size={15}/></span></div>
              <strong className={styles.summaryValue}>—</strong>
              <p>No live audits yet</p>
              <div className={styles.summaryFoot}><span className={styles.neutralDot}/> Connect a project to begin</div>
            </article>
            <article className={styles.summaryCard}>
              <div className={styles.summaryTop}><span className={styles.summaryIcon}><Target size={17}/></span><span className={styles.summaryLabel}>SEO OPPORTUNITIES</span><span className={styles.summaryArrow}><ArrowUpRight size={15}/></span></div>
              <strong className={styles.summaryValue}>—</strong>
              <p>Insights appear after an audit</p>
              <div className={styles.summaryFoot}><span className={styles.neutralDot}/> No analysis has run</div>
            </article>
            <article className={styles.summaryCard}>
              <div className={styles.summaryTop}><span className={styles.summaryIcon}><Clock3 size={17}/></span><span className={styles.summaryLabel}>NEXT SCHEDULED AUDIT</span><span className={styles.summaryArrow}><ArrowUpRight size={15}/></span></div>
              <strong className={styles.summaryValue}>—</strong>
              <p>Scheduling is not available yet</p>
              <div className={styles.summaryFoot}><span className={styles.neutralDot}/> Planned for a later phase</div>
            </article>
          </div>

          <div className={styles.lowerGrid}>
            <section className={styles.activityCard} aria-labelledby="activity-title">
              <div className={styles.cardHeading}><div><h2 id="activity-title">Recent activity</h2><p>A sample of how your workspace timeline could look.</p></div><span className={styles.samplePill}>Illustrative</span></div>
              <div className={styles.activityList}>
                {sampleActivity.map((item) => {
                  const Icon = item.icon;
                  return <div className={styles.activityItem} key={item.title}><span className={`${styles.activityIcon} ${styles[item.tone as "mint" | "lavender" | "peach"]}`}><Icon size={16}/></span><div className={styles.activityText}><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></div>;
                })}
              </div>
              <div className={styles.activityDisclaimer}><ArrowDownRight size={14}/> These entries are examples, not events from a real account.</div>
            </section>
            <aside className={styles.planCard}>
              <div className={styles.planOrb}><Zap size={19}/></div>
              <span className={styles.planEyebrow}>YOUR CURRENT PLAN</span>
              <h2>Free <span>forever</span></h2>
              <p>Start with the essentials. Upgrade only when your store needs more room to grow.</p>
              <div className={styles.planLimits}><div><span>Projects</span><strong>1</strong></div><div><span>URLs per audit</span><strong>100</strong></div><div><span>Audits per month</span><strong>3</strong></div></div>
              <div className={styles.planFoot}><ShieldCheck size={15}/> Proposed limits · Not enforced yet</div>
              <Link href="/#pricing" className={styles.planLink}>Compare plans <ArrowRight size={14}/></Link>
            </aside>
          </div>

          <footer className={styles.footer}><span>© {new Date().getFullYear()} Shopes</span><span><span className={styles.footerDot}/> Product preview · No live SEO data</span><Link href="/">Back to website <ArrowUpRight size={13}/></Link></footer>
        </div>
      </section>

      {showProjectForm && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProjectForm(false); }}>
        <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
          <button type="button" className={styles.modalClose} onClick={() => setShowProjectForm(false)} aria-label="Close dialog"><X size={18}/></button>
          <div className={styles.modalIcon}><Globe2 size={21}/></div>
          <span className={styles.smallEyebrow}>NEW WORKSPACE PROJECT</span>
          <h2 id="project-modal-title">Add your website</h2>
          <p>Prepare a project preview. This demo does not crawl or save your website.</p>
          <form onSubmit={handleProjectSubmit} className={styles.projectForm}>
            <label htmlFor="project-name">Project name <span>Optional</span></label>
            <input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g. My online store" maxLength={80}/>
            <label htmlFor="project-url">Website URL</label>
            <input id="project-url" value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} placeholder="yourstore.com" required maxLength={253} autoComplete="url"/>
            <div className={styles.modalHint}><ShieldCheck size={15}/> No crawl will run and no data will be saved.</div>
            <button className={styles.primaryButton} type="submit">Preview project <ArrowRight size={16}/></button>
          </form>
        </section>
      </div>}
    </main>
  );
}
