"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, Check, ChevronRight, CircleAlert, Clipboard,
  FileUp, Globe2, Layers3, LoaderCircle, PackageSearch, Search, ShieldCheck, Sparkles, Target, TrendingUp
} from "lucide-react";
import {
  buildRecommendations, scoreProduct, sentimentSignals,
  type ProductData, type ProductRecommendation
} from "../../lib/product-intelligence";
import styles from "./page.module.css";

type AnalysisResponse = {
  product: ProductData;
  competitors: ProductData[];
  checkedAt: string;
  limitations: string[];
};

function parseCsv(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("The CSV needs a header row and at least one product row.");
  const headers = rows[0].map((value) => value.trim().toLowerCase().replace(/[\s-]+/g, "_"));
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ""])));
}

function normalizeRecord(value: Record<string, unknown>, index: number): ProductData {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const found = value[key] ?? value[key.toLowerCase()] ?? value[key.replace(/_/g, " ")];
      if (found !== undefined && found !== null && String(found).trim() !== "") return found;
    }
    return undefined;
  };
  const number = (...keys: string[]) => {
    const raw = get(...keys);
    if (raw === undefined) return undefined;
    const parsed = Number(String(raw).replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3}(?:\D|$))/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const imageRaw = get("images", "image_urls", "image", "image_url");
  const images = typeof imageRaw === "string" ? imageRaw.split(/[|;\n]/).filter(Boolean).length : Array.isArray(imageRaw) ? imageRaw.length : 0;
  const reviews = get("review_text", "reviews", "customer_reviews");
  const product: ProductData = {
    id: String(index),
    url: String(get("url", "product_url", "link") || ""),
    title: String(get("title", "name", "product_name", "product_title") || ""),
    description: String(get("description", "product_description", "body_html", "details") || ""),
    price: number("price", "current_price", "sale_price"),
    currency: String(get("currency", "price_currency") || ""),
    brand: String(get("brand", "vendor", "manufacturer") || ""),
    category: String(get("category", "product_type", "type") || ""),
    imageCount: number("image_count") ?? images,
    imagesWithAlt: number("images_with_alt", "image_alt_count") ?? 0,
    canonical: String(get("canonical", "canonical_url") || ""),
    productSchema: String(get("product_schema", "schema_present") || "").toLowerCase() === "true",
    availability: String(get("availability", "stock_status", "inventory") || ""),
    reviewCount: number("review_count", "reviews_count", "rating_count"),
    rating: number("rating", "average_rating", "rating_value"),
    reviewText: typeof reviews === "string" ? reviews : Array.isArray(reviews) ? reviews.join(" ") : "",
    source: "catalog",
  };
  return product;
}

function formatPrice(product: ProductData): string {
  if (typeof product.price !== "number" || !Number.isFinite(product.price)) return "Not detected";
  return (product.currency ? product.currency + " " : "") + product.price.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function priorityClass(priority: ProductRecommendation["priority"]): string {
  return priority === "Critical" ? styles.critical : priority === "Recommended" ? styles.recommended : styles.optional;
}

export default function ProductIntelligenceClient() {
  const [url, setUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState(["", ""]);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [catalog, setCatalog] = useState<ProductData[]>([]);
  const [selectedCatalogIndex, setSelectedCatalogIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [copied, setCopied] = useState("");

  const selectedCatalogProduct = catalog[selectedCatalogIndex];
  const baseProduct = selectedCatalogProduct || result?.product;
  const activeProduct = useMemo(() => baseProduct ? ({
    ...baseProduct,
    title: editedTitle || baseProduct.title,
    description: editedDescription || baseProduct.description,
  }) : null, [baseProduct, editedTitle, editedDescription]);
  const score = useMemo(() => activeProduct ? scoreProduct(activeProduct) : null, [activeProduct]);
  const recommendations = useMemo(() => activeProduct ? buildRecommendations(activeProduct) : [], [activeProduct]);
  const sentiment = activeProduct?.reviewText ? sentimentSignals(activeProduct.reviewText) : null;

  async function runAnalysis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCatalog([]);
    setEditedTitle("");
    setEditedDescription("");
    setCopied("");
    try {
      const response = await fetch("/api/product-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), competitors: competitorUrls.filter((value) => value.trim()) }),
      });
      const payload = await response.json() as AnalysisResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "The product analysis could not be completed.");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The product analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  async function importCatalog(file?: File) {
    if (!file) return;
    setError("");
    setResult(null);
    setEditedTitle("");
    setEditedDescription("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Choose a catalog file smaller than 5 MB.");
      const text = await file.text();
      let records: Record<string, unknown>[];
      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text) as unknown;
        if (Array.isArray(parsed)) records = parsed as Record<string, unknown>[];
        else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { products?: unknown }).products)) records = (parsed as { products: Record<string, unknown>[] }).products;
        else if (parsed && typeof parsed === "object") records = [parsed as Record<string, unknown>];
        else throw new Error("The JSON file must contain a product object or an array of products.");
      } else {
        records = parseCsv(text);
      }
      const products = records.filter((record) => record && typeof record === "object").map(normalizeRecord).filter((product) => product.title || product.url);
      if (!products.length) throw new Error("No products with a title or URL were found. Check your catalog columns.");
      setCatalog(products.slice(0, 1000));
      setSelectedCatalogIndex(0);
      setUrl("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The catalog could not be imported.");
    }
  }

  async function copyDraft(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setError("Clipboard access was blocked. Select the draft text and copy it manually.");
    }
  }

  function useDraft(recommendation: ProductRecommendation) {
    if (!recommendation.draft) return;
    if (recommendation.target === "title") setEditedTitle(recommendation.draft);
    if (recommendation.target === "description") setEditedDescription(recommendation.draft);
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}><span className={styles.brandMark}><PackageSearch size={18} /></span><span>shopes<span>.</span></span></Link>
        <div className={styles.sidebarLabel}>WORKSPACE</div>
        <Link href="/dashboard" className={styles.navItem}><Layers3 size={16} /> Overview</Link>
        <Link href="/audit" className={styles.navItem}><ShieldCheck size={16} /> SEO audit</Link>
        <Link href="/keyword-research" className={styles.navItem}><Search size={16} /> Keyword research</Link>
        <Link href="/product-intelligence" className={styles.navItemActive}><Sparkles size={16} /> Product intelligence</Link>
        <div className={styles.sidebarFoot}><span className={styles.liveDot} /> FREE WORKSPACE</div>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={15} /> Workspace</Link>
          <span className={styles.topbarBadge}><ShieldCheck size={14} /> Evidence-first analysis</span>
        </header>

        <div className={styles.pageHeading}>
          <div>
            <div className={styles.eyebrow}><span /> PRODUCT INTELLIGENCE / BETA</div>
            <h1>Make every product <span>work harder.</span></h1>
            <p>Audit product-page readiness, uncover conversion gaps, and create practical fixes from the evidence available on the page or in your catalog.</p>
          </div>
          <div className={styles.headingIcon}><PackageSearch size={27} /></div>
        </div>

        <div className={styles.ingestGrid}>
          <form className={styles.sourceCard} onSubmit={runAnalysis}>
            <div className={styles.cardTop}><span className={styles.cardIcon}><Globe2 size={18} /></span><span className={styles.stepTag}>SOURCE 01</span></div>
            <h2>Analyze a product URL</h2>
            <p>Inspect public HTML, product metadata, structured data, images, price, and visible review signals.</p>
            <label htmlFor="product-url">Product page URL</label>
            <div className={styles.urlField}><Globe2 size={16} /><input id="product-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://store.com/products/item" required /></div>
            <div className={styles.competitorInputs}>
              <label>Optional competitor URLs <span>Compare up to 2 pages you choose</span></label>
              {competitorUrls.map((value, index) => <input key={index} value={value} onChange={(event) => setCompetitorUrls((current) => current.map((entry, i) => i === index ? event.target.value : entry))} placeholder={index === 0 ? "https://competitor.com/product" : "https://another-store.com/item"} />)}
            </div>
            <button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? <LoaderCircle className={styles.spin} size={16} /> : <Search size={16} />}{loading ? "Analyzing page…" : "Run product audit"}<ArrowRight size={15} /></button>
          </form>

          <div className={styles.sourceCard}>
            <div className={styles.cardTop}><span className={styles.cardIconAlt}><FileUp size={18} /></span><span className={styles.stepTag}>SOURCE 02</span></div>
            <h2>Upload catalog data</h2>
            <p>Score up to 1,000 product rows locally. Your file is processed in this browser and is not uploaded to Shopes.</p>
            <label className={styles.fileDrop}>
              <input type="file" accept=".csv,.json,application/json,text/csv" onChange={(event) => { void importCatalog(event.target.files?.[0]); event.currentTarget.value = ""; }} />
              <span className={styles.uploadIcon}><FileUp size={20} /></span>
              <strong>Choose CSV or JSON</strong>
              <small>Maximum file size: 5 MB</small>
              <span className={styles.fileFormats}>TITLE · DESCRIPTION · PRICE · IMAGES · REVIEWS</span>
            </label>
            {catalog.length > 0 && <div className={styles.catalogNotice}><Check size={15} /> Imported {catalog.length} product{catalog.length === 1 ? "" : "s"} <span>· browser-only</span></div>}
          </div>
        </div>

        {error && <div className={styles.errorBanner} role="alert"><CircleAlert size={17} />{error}</div>}

        {catalog.length > 0 && (
          <section className={styles.catalogSection}>
            <div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>CATALOG OVERVIEW</span><h2>Imported products <span>{catalog.length}</span></h2></div><span className={styles.mutedText}>Select a row to inspect its score</span></div>
            <div className={styles.catalogTableWrap}><table className={styles.catalogTable}><thead><tr><th>Product</th><th>Price</th><th>SEO title</th><th>Score</th><th /></tr></thead><tbody>
              {catalog.slice(0, 100).map((item, index) => {
                const itemScore = scoreProduct(item).overall;
                return <tr key={item.id || index} className={selectedCatalogIndex === index ? styles.selectedRow : ""}><td><button type="button" className={styles.productSelect} onClick={() => { setSelectedCatalogIndex(index); setEditedTitle(""); setEditedDescription(""); }}>{item.title || "Untitled product"}<small>{item.url || "Catalog row " + (index + 1)}</small></button></td><td>{formatPrice(item)}</td><td>{item.title ? item.title.length + " chars" : "Missing"}</td><td><span className={styles.tableScore}>{itemScore}</span></td><td><button type="button" className={styles.inspectButton} onClick={() => { setSelectedCatalogIndex(index); setEditedTitle(""); setEditedDescription(""); }}>Inspect <ChevronRight size={13} /></button></td></tr>;
              })}
            </tbody></table></div>
            {catalog.length > 100 && <p className={styles.mutedText}>Showing first 100 rows; scoring is available for all {catalog.length} imported products.</p>}
          </section>
        )}

        {activeProduct && score && (
          <>
            <section className={styles.scoreSection}>
              <div className={styles.scoreHero}>
                <div className={styles.scoreRing} style={{ background: "conic-gradient(#55e5f4 " + score.overall * 3.6 + "deg, #26313e 0deg)" }}><div><strong>{score.overall}</strong><span>/100</span></div></div>
                <div className={styles.scoreCopy}><span className={styles.sectionKicker}>{selectedCatalogProduct ? "CATALOG PRODUCT" : "PRODUCT AUDIT RESULT"}</span><h2>{activeProduct.title || "Untitled product"}</h2><p>{activeProduct.url || "Imported catalog record"}{activeProduct.brand ? " · " + activeProduct.brand : ""}</p><div className={styles.scoreMeta}><span className={styles.scoreStatus}>{score.overall >= 80 ? "Strong readiness" : score.overall >= 60 ? "Needs optimization" : "Priority improvements"}</span><span><ShieldCheck size={13} /> Evidence coverage {score.coverage}%</span></div></div>
                <div className={styles.scoreStat}><span>Detected price</span><strong>{formatPrice(activeProduct)}</strong><small>{activeProduct.availability || "Availability not detected"}</small></div>
              </div>

              <div className={styles.categoryGrid}>
                {score.categories.map((category) => <article className={styles.categoryCard} key={category.key}><div className={styles.categoryHead}><span>{category.label}</span><strong>{category.score}<small>/100</small></strong></div><div className={styles.progressTrack}><span style={{ width: category.score + "%" }} /></div><p>{category.detail}</p><small className={styles.weightLabel}>WEIGHT {category.weight}%</small></article>)}
              </div>
            </section>

            <div className={styles.resultsGrid}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>OPTIMIZATION QUEUE</span><h2>What to fix next</h2></div><span className={styles.recommendationCount}>{recommendations.length} actions</span></div>
                <p className={styles.panelIntro}>Rule-based recommendations grounded in detected page data. Drafts change this report only; they do not publish to your store.</p>
                <div className={styles.recommendationList}>
                  {recommendations.map((recommendation) => <article className={styles.recommendation} key={recommendation.id}>
                    <div className={styles.recommendationTop}><span className={priorityClass(recommendation.priority)}>{recommendation.priority}</span><span className={styles.recommendationCategory}>{recommendation.category}</span></div>
                    <h3>{recommendation.title}</h3><p>{recommendation.detail}</p>
                    {recommendation.draft && <div className={styles.draftBox}><span>Suggested draft</span><p>{recommendation.draft}</p><div className={styles.draftActions}><button type="button" onClick={() => useDraft(recommendation)}><Check size={13} /> Use in preview</button><button type="button" onClick={() => void copyDraft(recommendation.draft!, recommendation.id)}><Clipboard size={13} /> {copied === recommendation.id ? "Copied" : "Copy"}</button></div></div>}
                  </article>)}
                </div>
              </section>

              <div className={styles.rightColumn}>
                <section className={styles.panel}>
                  <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>ONE-CLICK DRAFTS</span><h2>Preview your edits</h2></div><Sparkles size={18} /></div>
                  <label className={styles.editLabel} htmlFor="draft-title">Product title</label><textarea id="draft-title" rows={2} value={editedTitle || activeProduct.title || ""} onChange={(event) => setEditedTitle(event.target.value)} placeholder="Product title draft" />
                  <label className={styles.editLabel} htmlFor="draft-description">Product description</label><textarea id="draft-description" rows={5} value={editedDescription || activeProduct.description || ""} onChange={(event) => setEditedDescription(event.target.value)} placeholder="Product description draft" />
                  <div className={styles.draftFooter}><span>Local preview only</span><button type="button" onClick={() => void copyDraft("Title: " + (editedTitle || activeProduct.title || "") + "\n\nDescription: " + (editedDescription || activeProduct.description || ""), "all-drafts")}><Clipboard size={13} />{copied === "all-drafts" ? "Copied" : "Copy drafts"}</button></div>
                </section>

                <section className={styles.panel}>
                  <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>CUSTOMER SIGNALS</span><h2>Review overview</h2></div><TrendingUp size={18} /></div>
                  {sentiment ? <><div className={styles.sentimentBar}><span style={{ width: sentiment.positive + "%" }} /><i style={{ width: sentiment.negative + "%" }} /></div><div className={styles.sentimentLegend}><span><i className={styles.positiveDot} />Positive keyword signals <b>{sentiment.positive}%</b></span><span><i className={styles.negativeDot} />Negative keyword signals <b>{sentiment.negative}%</b></span></div><p className={styles.smallNote}>{sentiment.note}</p></> : <div className={styles.emptySignals}><BarChart3 size={22} /><strong>No review text available</strong><p>Upload a review_text/reviews column to see a basic keyword signal. A numeric rating alone is not sentiment analysis.</p></div>}
                  <div className={styles.reviewStats}><div><span>Average rating</span><strong>{typeof activeProduct.rating === "number" ? activeProduct.rating.toFixed(1) + " / 5" : "Not detected"}</strong></div><div><span>Review count</span><strong>{typeof activeProduct.reviewCount === "number" ? activeProduct.reviewCount.toLocaleString() : "Not detected"}</strong></div></div>
                </section>
              </div>
            </div>

            {result?.competitors?.length ? <section className={styles.panel + " " + styles.benchmarkPanel}>
              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>COMPETITOR BENCHMARK</span><h2>Compare supplied product pages</h2></div><Target size={18} /></div>
              <p className={styles.panelIntro}>These are the URLs you supplied, not a ranking of top-performing products. No sales, traffic, or market-share data was available.</p>
              <div className={styles.benchmarkGrid}><article className={styles.benchmarkCard}><span className={styles.benchmarkLabel}>YOUR PRODUCT</span><h3>{result.product.title || "Product page"}</h3><strong>{formatPrice(result.product)}</strong><p>{result.product.description?.slice(0, 180) || "No description detected."}</p></article>
                {result.competitors.map((competitor, index) => {
                  const priceGap = typeof result.product.price === "number" && typeof competitor.price === "number" ? competitor.price - result.product.price : null;
                  return <article className={styles.benchmarkCard} key={competitor.url || index}><span className={styles.benchmarkLabel}>COMPARISON {index + 1}</span><h3>{competitor.title || "Competitor page"}</h3><strong>{formatPrice(competitor)}</strong><p>{competitor.description?.slice(0, 180) || "No description detected."}</p><div className={styles.priceGap}>{priceGap === null ? "Price gap unavailable" : priceGap > 0 ? "Your product is " + (result.product.currency || "") + Math.abs(priceGap).toFixed(2) + " lower" : priceGap < 0 ? "Your product is " + (result.product.currency || "") + Math.abs(priceGap).toFixed(2) + " higher" : "Same listed price"}</div></article>;
                })}
              </div>
            </section> : null}

            <section className={styles.disclosure}><ShieldCheck size={16} /><div><strong>What this score means</strong><p>Scores are transparent heuristics based on accessible HTML and catalog fields—not conversion predictions, search rankings, or an AI model’s judgment. Missing page fields lower the score; evidence coverage tells you how much data was detected. No changes are made to a live store.</p>{result?.checkedAt && <small>Analyzed {new Date(result.checkedAt).toLocaleString()}</small>}</div></section>
            {result?.limitations?.length ? <details className={styles.limitations}><summary>Analysis scope and limitations</summary><ul>{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
          </>
        )}

        {!activeProduct && !loading && !error && <section className={styles.emptyState}><div className={styles.emptyIcon}><PackageSearch size={26} /></div><h2>Start with one product or a catalog.</h2><p>Shopes will evaluate product metadata, content, imagery, visible offer signals, and available review fields. The results are a practical starting point—not a substitute for live store analytics.</p><div className={styles.emptyChecklist}><span><Check size={14} /> Transparent 0–100 scoring</span><span><Check size={14} /> Critical / Recommended / Optional actions</span><span><Check size={14} /> Optional, user-supplied competitor comparison</span></div></section>}

        <footer className={styles.footer}><span>SHOPES PRODUCT INTELLIGENCE · BETA</span><span><ShieldCheck size={13} /> No external AI or paid data API connected</span></footer>
      </section>
    </main>
  );
}
