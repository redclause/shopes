import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import { getArticle, getArticleIdFromSlug } from "../../../lib/blog/shopping-articles";
import styles from "../blog.module.css";

type Props = { params: Promise<{ slug: string }> };

async function resolveArticle(params: Props["params"]) {
  const { slug } = await params;
  const id = getArticleIdFromSlug(slug);
  return id === null ? null : getArticle(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await resolveArticle(params);
  if (!article) return { title: "Article not found — Shopes Blog", robots: { index: false, follow: false } };
  return {
    title: `${article.title} — Shopes Blog`,
    description: article.description,
    alternates: { canonical: `https://shopes.online/blog/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, url: `https://shopes.online/blog/${article.slug}`, siteName: "Shopes Blog" },
    twitter: { card: "summary", title: article.title, description: article.description }
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const article = await resolveArticle(params);
  if (!article) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: `https://shopes.online/blog/${article.slug}`,
    url: `https://shopes.online/blog/${article.slug}`,
    articleSection: article.topic,
    author: { "@type": "Organization", name: "Shopes Blog" },
    publisher: { "@type": "Organization", name: "Shopes", url: "https://shopes.online" },
    isPartOf: { "@type": "Blog", name: "Shopes Blog", url: "https://shopes.online/blog" },
    inLanguage: "en"
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://shopes.online/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://shopes.online/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://shopes.online/blog/${article.slug}` }
    ]
  };
  return <main className={styles.blogPage}>
    <header className={styles.articleHeader}>
      <Link href="/" className={styles.articleBrand} aria-label="Shopes home">
        <span className={styles.articleBrandMark}><ShoppingBag size={18} aria-hidden="true" /></span>
        <span>shopes<span className={styles.articleBrandDot}>.</span></span>
      </Link>
      <Link href="/blog" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> <span>Back to articles</span></Link>
    </header>
    <article className={styles.articleWrap}>
    <p className={styles.eyebrow}>Online shopping guide · {article.topic}</p><h1 className={styles.articleTitle}>{article.title}</h1>
    <p className={styles.articleDescription}>{article.description}</p>
    <div className={styles.articleBody}><div className={styles.prose} dangerouslySetInnerHTML={{ __html: article.content }} /></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c") }} />
  </article></main>;
}
