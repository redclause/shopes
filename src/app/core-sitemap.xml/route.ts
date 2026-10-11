import { ARTICLE_COUNT } from "../../lib/blog/shopping-articles";
import { buildCoreSitemapXml } from "../../lib/seo/sitemaps";

export async function GET() {
  const xml = buildCoreSitemapXml(ARTICLE_COUNT);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
