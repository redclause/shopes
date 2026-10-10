import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ARTICLE_COUNT, getArticleMeta } from "../../../../lib/blog/shopping-articles";
import styles from "../../blog.module.css";

const PAGE_SIZE = 100;
const PAGE_COUNT = Math.ceil(ARTICLE_COUNT / PAGE_SIZE);

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: raw } = await params;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 2 || page > PAGE_COUNT) return { title: "Shopes Blog" };
  return { title: `Shopes Blog — Page ${page}`, description: `Shopes online shopping articles, page ${page} of ${PAGE_COUNT}.`, alternates: { canonical: `/blog/page/${page}` } };
}

export default async function BlogPaginationPage({ params }: Props) {
  const { page: raw } = await params;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 2 || page > PAGE_COUNT) {
    if (raw === "1") redirect("/blog");
    notFound();
  }
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, ARTICLE_COUNT);
  const articles = Array.from({ length: end - start + 1 }, (_, index) => getArticleMeta(start + index)).filter((article): article is NonNullable<typeof article> => article !== null);
  return <main className={styles.blogPage}><div className={styles.container}>
    <p className={styles.eyebrow}>Shopes Blog · Page {page.toLocaleString()}</p><h1 className={styles.title}>Online shopping knowledge.</h1>
    <p className={styles.intro}>Articles {start.toLocaleString()}–{end.toLocaleString()} of {ARTICLE_COUNT.toLocaleString()}, covering online shopping, products, retailers, and informed buying decisions.</p>
    <section className={styles.grid} aria-label="Shopping guides">{articles.map(article => <Link key={article.id} href={`/blog/${article.slug}`} className={styles.card}>
      <p className={styles.cardMeta}>Shopping guide · #{article.id.toLocaleString()}</p><h2 className={styles.cardTitle}>{article.title}</h2><p className={styles.cardDescription}>{article.description}</p><span className={styles.readMore}>Read article →</span>
    </Link>)}</section>
    <nav className={styles.pagination} aria-label="Blog pagination"><Link className={styles.pageLink} href={page === 2 ? "/blog" : `/blog/page/${page - 1}`}>← Previous</Link><span className={styles.pageStatus}>Page {page.toLocaleString()} of {PAGE_COUNT.toLocaleString()}</span>{page < PAGE_COUNT && <Link className={styles.pageLink} href={`/blog/page/${page + 1}`}>Next →</Link>}</nav>
  </div></main>;
}
