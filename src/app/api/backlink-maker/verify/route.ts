import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { assertPublicHttpUrl } from "../../../../lib/public-url";
import { extractBacklinkEvidence, extractCanonicalUrl } from "../../../backlink-maker/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 1_000_000;
const TIMEOUT_MS = 8_000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ status: "unauthorized", message: "Sign in to use the Backlink Maker." }, { status: 401 });

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const body = await request.json();
    const targetUrl = await assertPublicHttpUrl(body?.targetUrl);
    const candidateUrl = await assertPublicHttpUrl(body?.candidateUrl);

    const controller = new AbortController();
    // Keep the timeout active while reading the response body, not only until
    // response headers arrive. A remote server can otherwise stall the reader.
    timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(candidateUrl, {
      signal: controller.signal,
      redirect: "manual",
      headers: { "user-agent": "ShopesBacklinkChecker/1.0 (+https://shopes.online)" },
      cache: "no-store",
    });

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
    let oversized = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        const remaining = MAX_HTML_BYTES - total;
        if (value.byteLength > remaining) {
          if (remaining > 0) chunks.push(value.subarray(0, remaining));
          total = MAX_HTML_BYTES;
          oversized = true;
          break;
        }
        chunks.push(value);
        total += value.byteLength;
        if (total >= MAX_HTML_BYTES) {
          // Probe once more without buffering the next chunk to distinguish an
          // exactly-at-limit response from a larger one.
          const next = await reader.read();
          oversized = !next.done && Boolean(next.value?.byteLength);
          break;
        }
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
    if (oversized) {
      return NextResponse.json({ status: "too-large", message: "The candidate page exceeds the 1 MB HTML verification limit. No verification result was recorded.", httpStatus: response.status }, { status: 413 });
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
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json({ status: timedOut ? "timeout" : "error", message: timedOut ? "The candidate page took too long to respond. Try again later." : message }, { status: timedOut ? 504 : 400 });
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
