import { ARTICLE_COUNT, SITEMAP_PAGE_SIZE, getArticleMeta } from "../../../lib/blog/shopping-articles";

const BASE_URL = "https://shopes.online";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id: rawId } = await params;
  const chunkId = Number(rawId);
  const chunkCount = Math.ceil(ARTICLE_COUNT / SITEMAP_PAGE_SIZE);
  if (!Number.isInteger(chunkId) || chunkId < 1 || chunkId > chunkCount) {
    return new Response("Not found", { status: 404 });
  }
  const start = (chunkId - 1) * SITEMAP_PAGE_SIZE + 1;
  const end = Math.min(chunkId * SITEMAP_PAGE_SIZE, ARTICLE_COUNT);
  const urls = Array.from({ length: end - start + 1 }, (_, index) => getArticleMeta(start + index))
    .filter((article): article is NonNullable<typeof article> => article !== null)
    .map(article => `<url><loc>${BASE_URL}/blog/${article.slug}</loc><changefreq>monthly</changefreq></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
