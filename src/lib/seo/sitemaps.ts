const BASE_URL = "https://shopes.online";

const INDEXABLE_PUBLIC_PATHS = ["/", "/privacy", "/terms"] as const;

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
    .map((path) => `<url><loc>${xmlEscape(new URL(path, BASE_URL).toString())}</loc></url>`)
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

export function buildSitemapIndexXml(): string {
  const location = `${BASE_URL}/core-sitemap.xml`;

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${xmlEscape(location)}</loc></sitemap></sitemapindex>`
  );
}
