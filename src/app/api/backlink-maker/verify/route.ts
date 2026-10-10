import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { extractBacklinkEvidence, extractCanonicalUrl } from "../../../backlink-maker/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePublicUrl(value: unknown): URL {
  if (typeof value !== "string" || value.length > 2048) throw new Error("Enter a valid public URL.");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (url.username || url.password) throw new Error("URLs containing credentials are not supported.");
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname === "metadata.google.internal") {
    throw new Error("Private or local addresses cannot be checked.");
  }
  if (isIP(hostname)) {
    if (hostname === "127.0.0.1" || hostname === "::1" || hostname.startsWith("10.") || hostname.startsWith("192.168.") || hostname.startsWith("169.254.") || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:")) {
      throw new Error("Private or local addresses cannot be checked.");
    }
  }
  return url;
}

async function assertPublicHost(url: URL) {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(hostname)) return;
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length) throw new Error("The website hostname could not be resolved.");
  for (const item of addresses) {
    const ip = item.address.toLowerCase();
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.") || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:") || ip === "0.0.0.0") {
      throw new Error("Private or local addresses cannot be checked.");
    }
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ status: "unauthorized", message: "Sign in to use the Backlink Maker." }, { status: 401 });
  try {
    const body = await request.json();
    const targetUrl = parsePublicUrl(body?.targetUrl);
    const candidateUrl = parsePublicUrl(body?.candidateUrl);
    await Promise.all([assertPublicHost(targetUrl), assertPublicHost(candidateUrl)]);

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
