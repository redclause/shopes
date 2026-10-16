import { ARTICLE_COUNT, SITEMAP_PAGE_SIZE } from "../blog/shopping-articles";

const BASE_URL = "https://shopes.online";

const INDEXABLE_PUBLIC_PATHS = ["/", "/privacy", "/terms", "/blog"] as const;
const BLOG_SITEMAP_COUNT = Math.ceil(ARTICLE_COUNT / SITEMAP_PAGE_SIZE);

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildCoreSitemapXml(paths: readonly string[] = INDEXABLE_PUBLIC_PATHS): string {
  const urls = paths
    .map((path) => `<url><loc>${xmlEscape(`${BASE_URL}${path}`)}</loc></url>`)
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

export function buildSitemapIndexXml(): string {
  const sitemapLocations = [
    `${BASE_URL}/core-sitemap.xml`,
    ...Array.from(
      { length: BLOG_SITEMAP_COUNT },
      (_, index) => `${BASE_URL}/blog-sitemap/${index + 1}`
    )
  ];
  const sitemaps = sitemapLocations
    .map((location) => `<sitemap><loc>${xmlEscape(location)}</loc></sitemap>`)
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`
  );
}
