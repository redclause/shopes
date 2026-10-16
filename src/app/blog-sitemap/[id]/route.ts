import { ARTICLE_COUNT, SITEMAP_PAGE_SIZE, getArticleMeta } from "../../../lib/blog/shopping-articles";

const BASE_URL = "https://shopes.online";
type Context = { params: Promise<{ id: string }> };

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: Context) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) {
    return new Response("Not found", { status: 404 });
  }

  const page = Number(rawId);
  const pageCount = Math.ceil(ARTICLE_COUNT / SITEMAP_PAGE_SIZE);
  if (!Number.isSafeInteger(page) || page < 1 || page > pageCount) {
    return new Response("Not found", { status: 404 });
  }

  const startId = (page - 1) * SITEMAP_PAGE_SIZE + 1;
  const endId = Math.min(startId + SITEMAP_PAGE_SIZE - 1, ARTICLE_COUNT);
  const urls: string[] = [];

  for (let id = startId; id <= endId; id += 1) {
    const article = getArticleMeta(id);
    if (article) {
      urls.push(`<url><loc>${xmlEscape(`${BASE_URL}/blog/${article.slug}`)}</loc></url>`);
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
