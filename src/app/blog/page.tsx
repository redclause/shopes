import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLE_COUNT, getArticleMeta } from "../../lib/blog/shopping-articles";
import styles from "./blog.module.css";

const PAGE_SIZE = 100;
const PAGE_COUNT = Math.ceil(ARTICLE_COUNT / PAGE_SIZE);

export const metadata: Metadata = {
  title: "Shopes Blog — Online Shopping",
  description: "Practical long-form guides for researching products, comparing online stores, understanding offers, and making informed shopping decisions.",
  alternates: { canonical: "https://shopes.online/blog" },
  openGraph: {
    title: "Online Shopping Guides & Product Research | Shopes Blog",
    description: "Practical guides to researching products, comparing online stores, understanding delivery and returns, and making informed buying decisions.",
    type: "website",
    url: "https://shopes.online/blog",
    siteName: "Shopes"
  },
  twitter: {
    card: "summary",
    title: "Online Shopping Guides & Product Research | Shopes Blog",
    description: "Practical guides to researching products, comparing online stores, and making informed buying decisions."
  }
};

export default function BlogIndexPage() {
  const articles = Array.from({ length: PAGE_SIZE }, (_, index) => getArticleMeta(index + 1)).filter((article): article is NonNullable<typeof article> => article !== null);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://shopes.online/blog#webpage",
        name: "Online Shopping Guides & Product Research",
        description: "Practical guides for researching products, comparing online stores, and making informed shopping decisions.",
        url: "https://shopes.online/blog",
        isPartOf: { "@id": "https://shopes.online/#website" },
        inLanguage: "en"
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://shopes.online/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://shopes.online/blog" }
        ]
      }
    ]
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <main className={styles.blogPage}><div className={styles.container}>
    <p className={styles.eyebrow}>Shopes Blog</p>
    <h1 className={styles.title}>Online shopping knowledge.</h1>
    <p className={styles.intro}>Practical, long-form guides for researching products, comparing online stores, understanding offers, and making better-informed shopping decisions.</p>
    <div className={styles.metaRow}><span className={styles.pill}>{ARTICLE_COUNT.toLocaleString()} articles in the source generator</span><span className={styles.pill}>{PAGE_SIZE} articles per page</span><span className={styles.pill}>10,000+ characters per article</span></div>
    <section className={styles.grid} aria-label="Latest shopping guides">{articles.map(article => <Link key={article.id} href={`/blog/${article.slug}`} className={styles.card}>
      <p className={styles.cardMeta}>Shopping guide · #{article.id.toLocaleString()}</p><h2 className={styles.cardTitle}>{article.title}</h2><p className={styles.cardDescription}>{article.description}</p><span className={styles.readMore}>Read article →</span>
    </Link>)}</section>
    <nav className={styles.pagination} aria-label="Blog pagination"><span className={styles.pageStatus}>Page 1 of {PAGE_COUNT.toLocaleString()}</span><Link className={styles.pageLink} href="/blog/page/2">Next →</Link></nav>
  </div></main>
  </>;
}
