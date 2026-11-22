import { NextResponse } from "next/server";

// Preview-only safety gate. Cloudflare's node:http request does not implement
// the pinned 'lookup' callback used by the Hetzner SEO audit; silently running
// that implementation here would weaken DNS-rebinding/SSRF protections.
// Keep this endpoint unavailable until a Workers-specific, fully tested
// public-IP-constrained transport replaces it. The main/Hetzner branch
// retains the complete functional SEO audit.

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json(
    {
      error: "Technical SEO Audit is temporarily unavailable on the Cloudflare migration preview.",
      code: "CLOUDFLARE_PREVIEW_AUDIT_DISABLED",
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}

export async function GET() { return unavailable(); }
export async function POST() { return unavailable(); }
