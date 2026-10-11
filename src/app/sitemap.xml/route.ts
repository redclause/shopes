import { ARTICLE_COUNT, SITEMAP_PAGE_SIZE } from "../../lib/blog/shopping-articles";
import { buildSitemapIndexXml } from "../../lib/seo/sitemaps";

export async function GET() {
  const xml = buildSitemapIndexXml(ARTICLE_COUNT, SITEMAP_PAGE_SIZE);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
