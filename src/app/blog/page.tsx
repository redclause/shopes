import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLE_COUNT, getArticleMeta } from "../../lib/blog/shopping-articles";
import styles from "./blog.module.css";

const PAGE_SIZE = 100;
const PAGE_COUNT = Math.ceil(ARTICLE_COUNT / PAGE_SIZE);

export const metadata: Metadata = {
  title: "Shopes Blog — Online Shopping",
  description: "Practical long-form guides for researching products, comparing online stores, understanding offers, and making informed shopping decisions.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Shopes Blog — Online Shopping", description: "Practical online shopping guides and product research.", type: "website" }
};

export default function BlogIndexPage() {
  const articles = Array.from({ length: PAGE_SIZE }, (_, index) => getArticleMeta(index + 1)).filter((article): article is NonNullable<typeof article> => article !== null);
  return <main className={styles.blogPage}><div className={styles.container}>
    <p className={styles.eyebrow}>Shopes Blog</p>
    <h1 className={styles.title}>Online shopping knowledge.</h1>
    <p className={styles.intro}>Practical, long-form guides for researching products, comparing online stores, understanding offers, and making better-informed shopping decisions.</p>
    <div className={styles.metaRow}><span className={styles.pill}>{ARTICLE_COUNT.toLocaleString()} articles in the source generator</span><span className={styles.pill}>{PAGE_SIZE} articles per page</span><span className={styles.pill}>10,000+ characters per article</span></div>
    <section className={styles.grid} aria-label="Latest shopping guides">{articles.map(article => <Link key={article.id} href={`/blog/${article.slug}`} className={styles.card}>
      <p className={styles.cardMeta}>Shopping guide · #{article.id.toLocaleString()}</p><h2 className={styles.cardTitle}>{article.title}</h2><p className={styles.cardDescription}>{article.description}</p><span className={styles.readMore}>Read article →</span>
    </Link>)}</section>
    <nav className={styles.pagination} aria-label="Blog pagination"><span className={styles.pageStatus}>Page 1 of {PAGE_COUNT.toLocaleString()}</span><Link className={styles.pageLink} href="/blog/page/2">Next →</Link></nav>
  </div></main>;
}
