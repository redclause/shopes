import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { backlinkSiteCatalog } from "../../../backlink-maker/site-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 300_000;
const TIMEOUT_MS = 5000;
const PATHS = [
  "/robots.txt",
  "/terms",
  "/terms-of-service",
  "/terms-and-conditions",
  "/community-guidelines",
  "/guidelines",
  "/rules",
  "/content-policy",
  "/acceptable-use",
  "/write-for-us",
  "/contribute",
  "/submit",
  "/submission-guidelines",
  "/editorial-guidelines",
];

function isPrivateAddress(address: string) {
  const value = address.toLowerCase();
  if (value.includes(":")) {
    if (value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") || value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.") || value.startsWith("::ffff:192.168.")) return true;
    return false;
  }
  const parts = value.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a >= 224);
}

async function assertPublicHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.endsWith(".internal")) throw new Error("Local hosts are not supported.");
  if (isIP(normalized)) {
    if (isPrivateAddress(normalized)) throw new Error("Private hosts are not supported.");
    return;
  }
  const addresses = await lookup(normalized, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) throw new Error("The host did not resolve to public addresses only.");
}

async function readText(url: URL) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      cache: "no-store",
      headers: { "user-agent": "ShopesPolicyReview/1.0 (+https://shopes.online)", accept: "text/plain,text/html,application/xhtml+xml,*/*;q=0.5" },
    });
    if (response.status >= 300 && response.status < 400) return { status: response.status, text: "", redirected: true };
    if (!response.ok) return { status: response.status, text: "", redirected: false };
    const reader = response.body?.getReader();
    if (!reader) return { status: response.status, text: "", redirected: false };
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (size < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        const chunk = value.subarray(0, Math.min(value.length, MAX_BYTES - size));
        chunks.push(chunk);
        size += chunk.length;
        if (size >= MAX_BYTES) break;
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
    return { status: response.status, text: new TextDecoder().decode(Buffer.concat(chunks)), redirected: false };
  } catch {
    return { status: 0, text: "", redirected: false };
  } finally {
    clearTimeout(timer);
  }
}

function plainText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .slice(0, 120_000);
}

function robotsSummary(text: string) {
  const lines = text.split(/\r?\n/);
  let appliesToAll = false;
  let currentAgent = "";
  const relevant: string[] = [];
  for (const line of lines) {
    const clean = line.split("#")[0].trim();
    if (!clean || !clean.includes(":")) continue;
    const [rawKey, ...rawValue] = clean.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (key === "user-agent") {
      currentAgent = value;
      if (value === "*") appliesToAll = true;
      continue;
    }
    if ((key === "disallow" || key === "allow") && (currentAgent === "*" || /googlebot|bingbot|\*/i.test(currentAgent)) && value) {
      relevant.push(`${key}: ${value}`);
    }
  }
  return { appliesToAll, directives: [...new Set(relevant)].slice(0, 30) };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const siteId = typeof body?.siteId === "string" ? body.siteId : "";
    const site = backlinkSiteCatalog.find((entry) => entry.id === siteId);
    if (!site) return NextResponse.json({ status: "error", message: "Choose a site from the Shopes catalog." }, { status: 400 });

    const origin = new URL(site.url).origin;
    await assertPublicHost(new URL(origin).hostname);
    const checks = await Promise.all(PATHS.map(async (path) => {
      const url = new URL(path, origin);
      const result = await readText(url);
      if (!result.status || result.status === 404 || result.status === 410 || result.redirected) return null;
      if (path === "/robots.txt") {
        return { path, kind: "robots", httpStatus: result.status, summary: robotsSummary(result.text), excerpt: result.text.slice(0, 1200) };
      }
      if (result.status >= 400 || !result.text) return null;
      const text = plainText(result.text);
      const keywords = ["guest post", "write for us", "contributor", "submission guideline", "submit an article", "community guidelines", "self-promotion", "promotional content", "external link", "spam", "advertising policy", "user-generated content"];
      const matched = keywords.filter((keyword) => text.toLowerCase().includes(keyword));
      if (!matched.length) return null;
      return { path, kind: "policy-page", httpStatus: result.status, matchedKeywords: matched, excerpt: text.slice(0, 900) };
    }));

    const evidence = checks.filter(Boolean);
    return NextResponse.json({
      status: "needs-human-review",
      site: { id: site.id, name: site.name, domain: site.domain },
      checkedAt: new Date().toISOString(),
      pagesChecked: PATHS.length,
      evidence,
      message: evidence.length
        ? "Potential policy pages were found. Review the official pages and the site's current rules manually before submitting."
        : "No obvious policy pages were detected at common URLs. This does not mean submissions are allowed; find and review the site's official terms or help pages manually.",
      automationAllowed: false,
      note: "This is a keyword-based discovery aid, not a legal or policy decision. robots.txt controls crawler access; it does not grant permission to submit forms or publish links. No forms were submitted.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to inspect this site's policy pages.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }
}
