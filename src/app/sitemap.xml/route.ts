import { ARTICLE_COUNT, SITEMAP_PAGE_SIZE } from "../../lib/blog/shopping-articles";

const BASE_URL = "https://shopes.online";
const SITEMAP_COUNT = Math.ceil(ARTICLE_COUNT / SITEMAP_PAGE_SIZE);

export async function GET() {
  const entries = [
    `<sitemap><loc>${BASE_URL}/sitemap.xml</loc></sitemap>`,
    ...Array.from({ length: SITEMAP_COUNT }, (_, index) =>
      `<sitemap><loc>${BASE_URL}/blog-sitemap/${index + 1}</loc></sitemap>`
    )
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
