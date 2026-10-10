import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shopes.online";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/api"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: new URL(siteUrl).host,
  };
}
