import type { NextConfig } from "next";

const nextConfig: NextConfig = { output: "standalone", poweredByHeader: false, reactStrictMode: true, env: { NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID } };
export default nextConfig;
