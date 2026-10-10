import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { assertPublicHttpUrl } from "../../../../lib/public-url";
import { extractBacklinkEvidence, extractCanonicalUrl } from "../../../backlink-maker/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ status: "unauthorized", message: "Sign in to use the Backlink Maker." }, { status: 401 });
  try {
    const body = await request.json();
    const targetUrl = await assertPublicHttpUrl(body?.targetUrl);
    const candidateUrl = await assertPublicHttpUrl(body?.candidateUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let response: Response;
    try {
      response = await fetch(candidateUrl, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": "ShopesBacklinkChecker/1.0 (+https://shopes.online)" },
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      let redirectUrl: string | undefined;
      if (location) {
        try {
          const destination = new URL(location, candidateUrl);
          if (destination.protocol === "http:" || destination.protocol === "https:") redirectUrl = destination.toString();
        } catch { /* Ignore malformed redirect destinations. */ }
      }
      return NextResponse.json({ status: "redirect", message: "The page redirected. Review the destination and verify that URL instead.", httpStatus: response.status, redirectUrl });
    }
    if (!response.ok) {
      return NextResponse.json({ status: "unavailable", message: "The candidate page could not be checked successfully.", httpStatus: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      return NextResponse.json({ status: "unavailable", message: "The candidate URL did not return an HTML page.", httpStatus: response.status });
    }
    const reader = response.body?.getReader();
    if (!reader) return NextResponse.json({ status: "unavailable", message: "The page returned no readable content." });
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (total < 1_000_000) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = value.subarray(0, Math.min(value.length, 1_000_000 - total));
          chunks.push(chunk);
          total += chunk.length;
          if (total >= 1_000_000) break;
        }
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
    const html = new TextDecoder().decode(Buffer.concat(chunks));
    const evidence = extractBacklinkEvidence(html, candidateUrl.toString(), targetUrl.toString());
    const canonicalUrl = extractCanonicalUrl(html, candidateUrl.toString());

    return NextResponse.json({
      status: evidence ? "found" : "not-found",
      message: evidence ? "A matching link to the target URL was found in the fetched page HTML." : "No matching link was found in the page HTML checked.",
      checkedUrl: candidateUrl.toString(),
      targetUrl: targetUrl.toString(),
      canonicalUrl,
      httpStatus: response.status,
      checkedAt: new Date().toISOString(),
      evidence,
      note: "This checks the fetched HTML only. It does not confirm indexing, link quality, or SEO value. rel=nofollow, sponsored, or ugc is reported when present.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify this page.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }
}
