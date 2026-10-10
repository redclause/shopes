"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, Compass, Globe2, Layers3, Menu, Search, ShieldCheck, ShoppingBag, Sparkles, Target, TrendingUp, X, Zap } from "lucide-react";

const plans = [
  { name: "Free", subtitle: "A clear starting point", price: 0, description: "Understand your store's technical SEO foundations.", features: ["1 website project", "100 URLs per audit", "Essential technical checks", "Basic keyword discovery", "Sitemap and robots.txt checks", "CSV export"], featured: false },
  { name: "Premium", subtitle: "For growing stores", price: 39, description: "Turn more searches into meaningful product discovery.", features: ["5 website projects", "10,000 URLs per audit", "Scheduled website audits", "Expanded keyword research", "Competitor and keyword gap analysis", "Search Console connection", "Product feed validation", "PDF and CSV reports"], featured: true },
  { name: "Max", subtitle: "For teams at scale", price: 129, description: "Advanced workflows for ambitious stores and agencies.", features: ["25 website projects", "100,000 URLs per audit", "Advanced competitor monitoring", "Expanded keyword tracking", "Catalog change monitoring", "API access and webhooks", "Team roles and shared workspaces", "White-label reporting"], featured: false }
];
const issues = [
  ["Product pages missing meta descriptions", "128 URLs", "orange"],
  ["Product schema detected", "1,842 URLs", "green"],
  ["Broken internal links", "17 URLs", "orange"]
];

export default function Home() {
  const [annual, setAnnual] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

  function startAudit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = siteUrl.trim();
    try {
      const hasProtocol = value.startsWith("https://") || value.startsWith("http://");
      const parsed = new URL(hasProtocol ? value : "https://" + value);
      if (!parsed.hostname.includes(".")) throw new Error("Invalid host");
      setMessage("Ready to set up an audit for " + parsed.hostname + ". Create a free account to continue.");
    } catch {
      setMessage(value ? "Enter a valid store domain, such as yourstore.com." : "Enter your store URL to get started.");
    }
  }

  return <main>
    <div className="announcement"><Sparkles size={14}/> Built for the next generation of e-commerce <ArrowRight size={14}/></div>
    <header className="site-header">
      <a className="brand" href="#" aria-label="Shopes home"><span className="brand-mark"><ShoppingBag size={19}/></span><span>shopes<span className="brand-dot">.</span></span></a>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"}><a href="#platform">Platform <ChevronDown size={13}/></a><a href="#features">Solutions</a><a href="#integrations">Integrations</a><a href="#pricing">Pricing</a></nav>
      <div className="header-actions"><a href="#get-started">Log in</a><a className="button button-dark button-small" href="#get-started">Get started <ArrowUpRight size={15}/></a></div>
    </header>

    <section className="hero section-wrap" id="get-started">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot"/> E-COMMERCE SEARCH INTELLIGENCE</div>
        <h1>Your store deserves<br/>to be <span className="headline-accent">found.</span></h1>
        <p className="hero-description">The SEO and product discovery platform built to help online stores show up, stand out, and get discovered across the web.</p>
        <form className="url-form" onSubmit={startAudit}><Globe2 size={18}/><input aria-label="Your store URL" placeholder="Enter your store URL" value={siteUrl} onChange={event => { setSiteUrl(event.target.value); setMessage(""); }}/><button type="submit">Analyze store <ArrowRight size={15}/></button></form>
        {message && <p className="form-message" role="status">{message}</p>}
        <div className="hero-proof"><span className="proof-avatars"><i>S</i><i>M</i><i>A</i></span><span>Built for teams who care about being found.</span><span className="proof-separator">·</span><span><ShieldCheck size={13}/> Practical insights, not guesswork</span></div>
        <div className="hero-links"><a href="#features">Explore the platform <ArrowRight size={14}/></a><span>Free plan available. No credit card required.</span></div>
      </div>
      <div className="hero-visual">
        <div className="dashboard-window">
          <div className="dash-top"><div className="dash-brand"><span className="mini-mark"><ShoppingBag size={12}/></span> shopes <span className="dash-tag">STORE OVERVIEW</span></div><div className="dash-user">ST</div></div>
          <div className="dash-content">
            <div className="dash-heading"><div><span className="tiny-label">PROJECT OVERVIEW</span><h3>northstar.store</h3></div><span className="live-status"><i/> Demo preview</span></div>
            <div className="metric-grid">
              <div className="metric-card"><span>Site health</span><div className="metric-number">92<span>/100</span></div><div className="metric-foot"><TrendingUp size={12}/> Technical overview</div><div className="health-ring"><span>92</span></div></div>
              <div className="metric-card"><span>Tracked keywords</span><div className="metric-number">1,284</div><div className="metric-foot"><ArrowUpRight size={12}/> Keyword workspace</div><div className="spark-bars">{[26,38,32,46,36,55,42,65,51,72,59,84,69,96].map((height,index)=><i key={index} style={{height: height + "%"}}/>)}</div></div>
            </div>
            <div className="chart-card"><div className="chart-head"><div><span className="tiny-label">ORGANIC VISIBILITY</span><strong>Search opportunity overview</strong></div><span className="chart-period">Last 30 days <ChevronDown size={12}/></span></div><div className="chart-summary"><strong>Opportunity map</strong><span>Illustrative preview</span></div><div className="chart-area"><div className="chart-y"><span>High</span><span>Medium</span><span>Low</span></div><svg viewBox="0 0 440 100" role="img" aria-label="Illustrative trend chart" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9be8c7" stopOpacity=".45"/><stop offset="100%" stopColor="#9be8c7" stopOpacity="0"/></linearGradient></defs><path d="M0 84 C24 78 25 61 51 68 S86 75 106 51 S144 67 164 44 S197 58 221 35 S255 53 279 30 S315 41 333 23 S365 42 388 14 S420 21 440 4 L440 100 L0 100 Z" fill="url(#chartFill)"/><path d="M0 84 C24 78 25 61 51 68 S86 75 106 51 S144 67 164 44 S197 58 221 35 S255 53 279 30 S315 41 333 23 S365 42 388 14 S420 21 440 4" fill="none" stroke="#35a77d" strokeWidth="2.5" strokeLinecap="round"/></svg></div></div>
            <div className="audit-list"><div className="audit-list-head"><strong>Technical checklist</strong><span>Example data</span></div>{issues.map(row=><div className="audit-row" key={row[0]}><i className={"status-dot " + row[2]}/><span>{row[0]}</span><small>{row[1]}</small></div>)}</div>
          </div>
        </div>
        <div className="floating-note note-one"><span className="note-icon"><Target size={15}/></span><span><b>Find your next win</b><small>Prioritized opportunities</small></span><ArrowUpRight size={15}/></div>
        <div className="floating-note note-two"><span className="note-icon green"><Check size={15}/></span><span><b>Made for commerce</b><small>Products · Categories · Feeds</small></span></div>
      </div>
    </section>

    <section className="trust-strip"><div className="section-wrap trust-inner"><span>ONE WORKSPACE FOR</span><b><Search size={16}/> Search engines</b><b><ShoppingBag size={16}/> Product catalogs</b><b><Compass size={16}/> Discovery channels</b><b><BarChart3 size={16}/> SEO intelligence</b></div></section>

    <section className="section-wrap feature-section" id="platform">
      <div className="section-intro"><div className="eyebrow">ONE STORE. MORE WAYS TO BE FOUND.</div><h2>Everything that helps<br/>customers <span className="headline-accent">find you.</span></h2><p>Stop stitching together disconnected tools. Bring technical SEO, keyword research, and product discovery into one clear workspace.</p></div>
      <div className="feature-grid" id="features">
        <article className="feature-card feature-large"><div className="feature-icon purple"><Search size={21}/></div><span className="feature-kicker">01 / TECHNICAL SEO</span><h3>Know what is holding<br/>your store back.</h3><p>Crawl your store, uncover technical issues, and turn audit findings into a prioritized plan your team can act on.</p><a href="#get-started">Explore site audits <ArrowRight size={15}/></a><div className="mini-audit"><div className="mini-audit-head"><span>Latest audit</span><span className="mini-chip">Overview</span></div><div className="mini-score"><strong>Site health</strong><b>92 <small>/100</small></b></div><div className="mini-progress"><i/></div><div className="mini-audit-foot"><span>34 passed</span><span>6 to review</span></div></div></article>
        <article className="feature-card"><div className="feature-icon blue"><Target size={21}/></div><span className="feature-kicker">02 / KEYWORD INTELLIGENCE</span><h3>Find the searches<br/>worth pursuing.</h3><p>Discover keyword ideas, understand intent, and spot gaps between your store and competitors.</p><a href="#pricing">Explore keywords <ArrowRight size={15}/></a><div className="keyword-pills"><span>running shoes <b>1.2k</b></span><span>trail sneakers <b>840</b></span><span>waterproof boots <b>620</b></span></div></article>
        <article className="feature-card"><div className="feature-icon green"><Layers3 size={21}/></div><span className="feature-kicker">03 / PRODUCT DISCOVERY</span><h3>Make every product<br/>easier to discover.</h3><p>Validate product data, spot feed errors, and prepare catalogs for supported discovery destinations.</p><a href="#integrations">Explore integrations <ArrowRight size={15}/></a><div className="channel-stack"><span><ShoppingBag size={14}/> Product catalog <i>Validation-ready</i></span><span><Globe2 size={14}/> Search channels <i>Connect sources</i></span></div></article>
        <article className="feature-card"><div className="feature-icon amber"><TrendingUp size={21}/></div><span className="feature-kicker">04 / COMPETITIVE CONTEXT</span><h3>See the gaps.<br/>Choose your next move.</h3><p>Compare keyword coverage and discover content and category opportunities you may be missing.</p><a href="#pricing">Explore opportunities <ArrowRight size={15}/></a><div className="gap-bars"><span>YOUR STORE <i><b style={{width:"61%"}}/></i></span><span>COMPETITOR A <i><b style={{width:"82%"}}/></i></span><span>COMPETITOR B <i><b style={{width:"44%"}}/></i></span></div></article>
      </div>
    </section>

    <section className="integration-section" id="integrations"><div className="section-wrap integration-inner"><div className="integration-copy"><div className="eyebrow">CONNECTED COMMERCE</div><h2>Your catalog.<br/>Your channels.<br/><span className="headline-accent">One clearer view.</span></h2><p>Bring product data and discovery workflows together. Connect supported services, validate catalog requirements, and know what needs attention before you publish.</p><a className="button button-dark" href="#get-started">Explore the platform <ArrowRight size={16}/></a><small>Integrations require supported access and account eligibility.</small></div><div className="integration-panel"><div className="integration-panel-head"><div><span className="tiny-label">DISCOVERY ECOSYSTEM</span><h3>Built around your stack</h3></div><span className="integration-count">Integration hub</span></div><div className="integration-items">{[{name:"Google Search Console",desc:"Search performance and coverage",icon:"G",tone:"google"},{name:"Bing Webmaster Tools",desc:"Crawl and search insights",icon:"b",tone:"bing"},{name:"Meta commerce",desc:"Catalog workflow support",icon:"∞",tone:"meta"},{name:"Shopify and WooCommerce",desc:"Store catalog connections",icon:"S",tone:"shop"},{name:"Zoovu and Searchspring",desc:"Product discovery ecosystem",icon:"✳",tone:"zoovu"},{name:"Product feeds",desc:"Validate, export, monitor",icon:"↗",tone:"feed"}].map(item=><div className="integration-item" key={item.name}><span className={"integration-logo " + item.tone}>{item.icon}</span><span className="integration-item-copy"><b>{item.name}</b><small>{item.desc}</small></span><span className="integration-arrow"><ArrowUpRight size={15}/></span></div>)}</div><p className="integration-foot"><ShieldCheck size={14}/> Availability depends on official APIs, permissions, and provider terms.</p></div></div></section>

    <section className="section-wrap workflow-section"><div className="section-intro centered"><div className="eyebrow">LESS GUESSWORK. MORE DIRECTION.</div><h2>A clearer path from audit<br/>to <span className="headline-accent">opportunity.</span></h2><p>Get a practical view of what is happening, what matters, and what to do next.</p></div><div className="workflow-grid"><article><span className="step-number">01</span><div className="workflow-icon"><Globe2 size={21}/></div><h3>Connect your store</h3><p>Start with a domain and configure your store, market, and preferred data sources.</p></article><article><span className="step-number">02</span><div className="workflow-icon"><Search size={21}/></div><h3>Discover the gaps</h3><p>Review technical findings, keyword opportunities, and product data issues.</p></article><article><span className="step-number">03</span><div className="workflow-icon"><Zap size={21}/></div><h3>Prioritize your next move</h3><p>Turn evidence into a focused action list and track progress over time.</p></article></div></section>

    <section className="pricing-section" id="pricing"><div className="section-wrap"><div className="pricing-top"><div><div className="eyebrow">SIMPLE, TRANSPARENT PLANS</div><h2>Start free. <span className="headline-accent">Scale with clarity.</span></h2><p>Start with the essentials. Upgrade when your store needs more depth and scale.</p></div><div className="billing-toggle"><span className={!annual ? "selected" : ""}>Monthly</span><button aria-label="Toggle annual billing" aria-pressed={annual} onClick={() => setAnnual(!annual)} className={annual ? "toggle on" : "toggle"}><i/></button><span className={annual ? "selected" : ""}>Yearly <b>Save 20%</b></span></div></div><div className="pricing-grid">{plans.map(plan => { const price = annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price; return <article className={plan.featured ? "price-card featured" : "price-card"} key={plan.name}>{plan.featured && <div className="popular-ribbon">MOST POPULAR</div>}<div className="plan-head"><span>{plan.name}</span><span className="plan-subtitle">{plan.subtitle}</span></div><p className="plan-description">{plan.description}</p><div className="plan-price"><strong>{"$" + price}</strong><span>{plan.price === 0 ? "forever" : annual ? "/ month, billed yearly" : "/ month"}</span></div>{annual && plan.price > 0 && <div className="annual-note">Billed annually · Save 20%</div>}<a className={plan.featured ? "button button-dark plan-cta" : "button button-light plan-cta"} href="#get-started">{plan.name === "Free" ? "Start for free" : "Choose " + plan.name} <ArrowRight size={15}/></a><div className="plan-divider"/><span className="includes-label">WHAT IS INCLUDED</span><ul>{plan.features.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul></article>; })}</div><p className="pricing-note"><ShieldCheck size={14}/> Pricing and limits are initial examples. Billing and paid entitlements require backend configuration.</p></div></section>

    <section className="final-cta section-wrap"><div className="cta-decoration"><span/><span/><span/></div><div className="eyebrow">YOUR NEXT GROWTH OPPORTUNITY STARTS HERE</div><h2>Make discoverability<br/>your <span>competitive edge.</span></h2><p>Bring your store&apos;s SEO and product discovery into focus.</p><a href="#get-started" className="button button-dark">Get started for free <ArrowRight size={16}/></a><small>No credit card required to explore the free plan.</small></section>

    <footer className="site-footer"><div className="section-wrap"><div className="footer-main"><div className="footer-brand"><a className="brand" href="#"><span className="brand-mark"><ShoppingBag size={19}/></span><span>shopes<span className="brand-dot">.</span></span></a><p>SEO and product discovery intelligence for online stores.</p></div><div className="footer-column"><b>Platform</b><a href="#features">Site audits</a><a href="#features">Keyword research</a><a href="#integrations">Product discovery</a><a href="#pricing">Pricing</a></div><div className="footer-column"><b>Resources</b><a href="#platform">How it works</a><a href="#integrations">Integrations</a><a href="#pricing">Plans and limits</a><a href="mailto:hello@shopes.online">Contact</a></div><div className="footer-column"><b>Company</b><a href="mailto:hello@shopes.online">Support</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Shopes. Built for better discovery.</span><span><ShieldCheck size={14}/> Clear data. Practical decisions.</span></div></div></footer>
    <div className="sr-only" id="privacy">Privacy policy will be published before production launch.</div><div className="sr-only" id="terms">Terms of service will be published before production launch.</div>
  </main>;
}
