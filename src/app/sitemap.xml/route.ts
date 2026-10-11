import { ARTICLE_COUNT, SITEMAP_PAGE_SIZE } from "../../lib/blog/shopping-articles";

const BASE_URL = "https://shopes.online";
const SITEMAP_COUNT = Math.ceil(ARTICLE_COUNT / SITEMAP_PAGE_SIZE);

export async function GET() {
  const sitemapLocations = [
    `${BASE_URL}/core-sitemap.xml`,
    ...Array.from(
      { length: SITEMAP_COUNT },
      (_, index) => `${BASE_URL}/blog-sitemap/${index + 1}`
    )
  ];

  const entries = sitemapLocations
    .map((location) => `<sitemap><loc>${location}</loc></sitemap>`)
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
