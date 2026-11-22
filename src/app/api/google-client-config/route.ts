import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

// Only the public OAuth Client ID is returned. All Google client secrets,
// AUTH_SECRET, OAuth tokens, and session data stay strictly server-side.
// Reading this at runtime removes the need to expose a build environment
// variable to every CI build, and works with Cloudflare Workers' process.env.
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  if (!/^[a-z0-9-]+\.apps\.googleusercontent\.com$/i.test(clientId)) {
    return NextResponse.json(
      { error: "Google sign-in is not configured." },
      { status: 503, headers },
    );
  }
  return NextResponse.json({ clientId }, { headers });
}
