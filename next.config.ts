import type { NextConfig } from "next";

const nextConfig: NextConfig = { ...(process.env.CLOUDFLARE_WORKERS_BUILD === "1" ? {} : { output: "standalone" }), poweredByHeader: false, reactStrictMode: true, env: { NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "" } };
// Keep preview deployments out of search results. Hetzner defaults stay unchanged.
if (process.env.CLOUDFLARE_PREVIEW_NOINDEX === "1") {
  nextConfig.headers = async () => [
    { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
  ];
}
export default nextConfig;
