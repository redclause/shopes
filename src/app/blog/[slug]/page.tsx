import type { Metadata } from "next";
import Link from "next/link";
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
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, url: `/blog/${article.slug}`, siteName: "Shopes Blog" },
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
    mainEntityOfPage: `/blog/${article.slug}`,
    url: `/blog/${article.slug}`,
    articleSection: article.topic,
    author: { "@type": "Organization", name: "Shopes Blog" },
    publisher: { "@type": "Organization", name: "Shopes", url: "https://shopes.online" }
  };
  return <main className={styles.blogPage}><article className={styles.articleWrap}>
    <Link href="/blog" className={styles.backLink}>← Shopes Blog</Link>
    <p className={styles.eyebrow}>Online shopping guide · {article.topic}</p><h1 className={styles.articleTitle}>{article.title}</h1>
    <p className={styles.articleDescription}>{article.description}</p>
    <div className={styles.articleBody}><div className={styles.prose} dangerouslySetInnerHTML={{ __html: article.content }} /></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </article></main>;
}
