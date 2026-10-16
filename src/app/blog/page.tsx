import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ARTICLE_COUNT, getArticleMeta } from "../../lib/blog/shopping-articles";
import styles from "./blog.module.css";

const SITE_URL = "https://shopes.online";
const PAGE_SIZE = 100;
const PAGE_COUNT = Math.ceil(ARTICLE_COUNT / PAGE_SIZE);
const BLOG_URL = `${SITE_URL}/blog`;
const BLOG_DESCRIPTION =
  "Practical guides to researching products, comparing online stores, understanding delivery and returns, and making informed buying decisions.";

export const metadata: Metadata = {
  title: "Online Shopping Guides",
  description: BLOG_DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: BLOG_URL },
  openGraph: {
    title: "Online Shopping Guides & Product Research | Shopes Blog",
    description: BLOG_DESCRIPTION,
    type: "website",
    url: BLOG_URL,
    siteName: "Shopes"
  },
  twitter: {
    card: "summary",
    title: "Online Shopping Guides & Product Research | Shopes Blog",
    description: BLOG_DESCRIPTION
  }
};

export default function BlogIndexPage() {
  const articles = Array.from({ length: PAGE_SIZE }, (_, index) =>
    getArticleMeta(index + 1)
  ).filter(
    (article): article is NonNullable<typeof article> => article !== null
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BLOG_URL}#webpage`,
        name: "Online Shopping Guides & Product Research",
        description: BLOG_DESCRIPTION,
        url: BLOG_URL,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en"
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
      <main className={styles.blogPage}>
        <header className={styles.articleHeader}>
          <Link href="/" className={styles.articleBrand} aria-label="Shopes home">
            <span className={styles.articleBrandMark}>
              <ShoppingBag size={18} aria-hidden="true" />
            </span>
            <span>
              shopes<span className={styles.articleBrandDot}>.</span>
            </span>
          </Link>
        </header>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Shopes Blog</p>
          <h1 className={styles.title}>Online shopping knowledge.</h1>
          <p className={styles.intro}>
            Practical guides for researching products, comparing online stores,
            understanding offers, and making better-informed shopping decisions.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.pill}>Product research</span>
            <span className={styles.pill}>Store comparisons</span>
            <span className={styles.pill}>Buying checklists</span>
          </div>
          <section
            className={styles.grid}
            aria-label="Latest shopping guides"
          >
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className={styles.card}
              >
                <p className={styles.cardMeta}>
                  Shopping guide · #{article.id.toLocaleString()}
                </p>
                <h2 className={styles.cardTitle}>{article.title}</h2>
                <p className={styles.cardDescription}>{article.description}</p>
                <span className={styles.readMore}>Read article →</span>
              </Link>
            ))}
          </section>
          <nav className={styles.pagination} aria-label="Blog pagination">
            <span className={styles.pageStatus}>
              Page 1 of {PAGE_COUNT.toLocaleString()}
            </span>
            {PAGE_COUNT > 1 && (
              <Link className={styles.pageLink} href="/blog/page/2">
                Next →
              </Link>
            )}
          </nav>
        </div>
      </main>
    </>
  );
}
