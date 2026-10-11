import { ARTICLE_COUNT } from "../../lib/blog/shopping-articles";

const BASE_URL = "https://shopes.online";
const PAGE_SIZE = 100;
const PAGE_COUNT = Math.ceil(ARTICLE_COUNT / PAGE_SIZE);

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const paths = [
    "/",
    "/blog",
    ...Array.from(
      { length: Math.max(0, PAGE_COUNT - 1) },
      (_, index) => `/blog/page/${index + 2}`
    )
  ];

  const urls = paths
    .map((path) => {
      const location = xmlEscape(`${BASE_URL}${path}`);
      return `<url><loc>${location}</loc></url>`;
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
