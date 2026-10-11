const BASE_URL = "https://shopes.online";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildCoreSitemapXml(articleCount: number, pageSize = 100): string {
  const pageCount = Math.ceil(articleCount / pageSize);
  const paths = [
    "/",
    "/blog",
    ...Array.from(
      { length: Math.max(0, pageCount - 1) },
      (_, index) => `/blog/page/${index + 2}`
    )
  ];

  const urls = paths
    .map((path) => `<url><loc>${xmlEscape(`${BASE_URL}${path}`)}</loc></url>`)
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

export function buildSitemapIndexXml(articleCount: number, pageSize: number): string {
  const sitemapCount = Math.ceil(articleCount / pageSize);
  const locations = [
    `${BASE_URL}/core-sitemap.xml`,
    ...Array.from(
      { length: sitemapCount },
      (_, index) => `${BASE_URL}/blog-sitemap/${index + 1}`
    )
  ];

  const entries = locations
    .map((location) => `<sitemap><loc>${xmlEscape(location)}</loc></sitemap>`)
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`
  );
}
