import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8_000;
const USER_AGENT = "ShopesTechnicalAudit/1.0 (+https://shopes.online)";

type Finding = {
  id: string;
  title: string;
  status: "pass" | "warning" | "error";
  detail: string;
};

function isPublicIPv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 0 && c === 2) || (b === 88 && c === 99))) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 192 && b === 31 && c === 196) return true;
  if (a === 192 && b === 52 && c === 193) return false;
  if (a === 192 && b === 175 && c === 48) return false;
  if (a === 192 && b === 0 && c === 0) return false;
  if (a === 192 && b === 0 && c === 2) return false;
  if (a === 192 && b === 31 && c === 196) return true;
  if (a === 192 && b === 0 && c === 9) return false;
  if (a === 192 && b === 0 && c === 10) return false;
  return true;
}

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIPv4(address);
  if (family !== 6) return false;
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:") || normalized === "::" || normalized === "::1") return false;
  // Global unicast IPv6 is in 2000::/3. Exclude documentation and special-use ranges.
  if (!/^2[0-9a-f]{0,3}:/i.test(normalized)) return false;
  if (/^2001:db8:/i.test(normalized) || /^2001:0:/i.test(normalized)) return false;
  return true;
}

async function validateAndResolve(input: string): Promise<{ url: URL; address: string; family: number }> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a valid absolute website URL, including https://.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP and HTTPS website URLs are supported.");
  if (url.username || url.password) throw new Error("URLs containing usernames or passwords are not allowed.");
  const expectedPort = url.protocol === "https:" ? "443" : "80";
  if (url.port && url.port !== expectedPort) throw new Error("Only standard HTTP and HTTPS ports are allowed.");
  if (url.hostname.length > 253 || !url.hostname.includes(".") || url.hostname.endsWith(".local") || url.hostname.endsWith(".internal") || url.hostname === "localhost") {
    throw new Error("Enter a public website hostname.");
  }
  if (isIP(url.hostname)) throw new Error("For safety, enter a public domain name rather than an IP address.");

  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) {
    throw new Error("This hostname does not resolve exclusively to public IP addresses.");
  }
  const selected = addresses[0];
  return { url, address: selected.address, family: selected.family };
}

function requestPage(target: URL, address: string, family: number): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const transport = target.protocol === "https:" ? httpsRequest : httpRequest;
    const pinnedLookup = (
      _hostname: string,
      options: { all?: boolean },
      callback: (error: NodeJS.ErrnoException | null, address: string | { address: string; family: number }[], family?: number) => void,
    ) => {
      if (options.all) callback(null, [{ address, family }]);
      else callback(null, address, family);
    };

    const request = transport(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === "https:" ? 443 : 80),
        path: target.pathname + target.search,
        method: "GET",
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml;q=0.9",
          "accept-encoding": "identity",
          connection: "close",
        },
        lookup: pinnedLookup as never,
        ...(target.protocol === "https:" ? { servername: target.hostname } : {}),
        agent: false,
      },
      (response) => resolve(response),
    );
    request.setTimeout(TIMEOUT_MS, () => request.destroy(new Error("The website request timed out.")));
    request.on("error", reject);
    request.end();
  });
}

async function fetchPublicHtml(input: string): Promise<{ html: string; status: number; finalUrl: string; contentType: string }> {
  let current = input;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const validated = await validateAndResolve(current);
    const response = await requestPage(validated.url, validated.address, validated.family);
    const status = response.statusCode || 0;
    if ([301, 302, 303, 307, 308].includes(status)) {
      const location = response.headers.location;
      response.destroy();
      if (!location || redirects === MAX_REDIRECTS) throw new Error("The website redirected too many times or returned an invalid redirect.");
      current = new URL(location, validated.url).toString();
      continue;
    }

    const contentType = String(response.headers["content-type"] || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      response.destroy();
      throw new Error("The URL did not return an HTML page, so a technical HTML audit could not be completed.");
    }
    const length = Number(response.headers["content-length"] || 0);
    if (Number.isFinite(length) && length > MAX_HTML_BYTES) {
      response.destroy();
      throw new Error("The HTML document exceeds the 1 MB audit limit.");
    }

    const chunks: Buffer[] = [];
    let bytes = 0;
    try {
      const html = await new Promise<string>((resolve, reject) => {
        response.on("data", (chunk: Buffer | string) => {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          bytes += buffer.byteLength;
          if (bytes > MAX_HTML_BYTES) {
            response.destroy(new Error("The HTML document exceeds the 1 MB audit limit."));
            return;
          }
          chunks.push(buffer);
        });
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        response.on("error", reject);
      });
      return { html, status, finalUrl: validated.url.toString(), contentType };
    } catch (error) {
      throw error instanceof Error ? error : new Error("Could not read the website response.");
    }
  }
  throw new Error("The website redirected too many times.");
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag)) !== null) {
    result[match[1].toLowerCase()] = (match[2] ?? match[3] ?? match[4] ?? "").trim();
  }
  return result;
}

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim();
}

function auditHtml(html: string, status: number, pageUrl: string): Finding[] {
  const findings: Finding[] = [];
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const title = titleMatch ? cleanText(titleMatch[1]) : "";
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  let description = "";
  let robots = "";
  for (const tag of tags) {
    const attrs = attributes(tag);
    if ((attrs.name || "").toLowerCase() === "description") description = attrs.content || "";
    if ((attrs.name || "").toLowerCase() === "robots") robots = attrs.content || "";
  }
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  let canonical = "";
  for (const tag of linkTags) {
    const attrs = attributes(tag);
    if ((attrs.rel || "").toLowerCase().split(/\s+/).includes("canonical")) canonical = attrs.href || "";
  }

  const headings: Record<string, number> = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  for (const match of html.matchAll(/<h([1-6])\b[^>]*>/gi)) headings["h" + match[1]] += 1;
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const missingAlt = images.filter((tag) => !Object.prototype.hasOwnProperty.call(attributes(tag), "alt") || attributes(tag).alt.trim() === "").length;
  const anchors = html.match(/<a\b[^>]*>/gi) || [];
  let internalLinks = 0;
  let externalLinks = 0;
  let linksWithoutHref = 0;
  const base = new URL(pageUrl);
  for (const tag of anchors) {
    const href = attributes(tag).href;
    if (!href) { linksWithoutHref += 1; continue; }
    try {
      const parsed = new URL(href, base);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        if (parsed.hostname === base.hostname) internalLinks += 1;
        else externalLinks += 1;
      }
    } catch { /* Ignore malformed or non-web links in this count. */ }
  }

  findings.push({ id: "http-status", title: "HTTP response", status: status >= 200 && status < 300 ? "pass" : "warning", detail: "The page returned HTTP " + status + "." });
  findings.push({ id: "title", title: "Page title", status: !title ? "error" : title.length < 15 || title.length > 60 ? "warning" : "pass", detail: !title ? "No HTML title element was found." : "Title found (" + title.length + " characters): " + title.slice(0, 180) });
  findings.push({ id: "description", title: "Meta description", status: !description ? "warning" : description.length < 70 || description.length > 160 ? "warning" : "pass", detail: !description ? "No meta description was found." : "Description found (" + description.length + " characters): " + description.slice(0, 180) });
  findings.push({ id: "canonical", title: "Canonical URL", status: canonical ? "pass" : "warning", detail: canonical ? "Canonical link found: " + canonical.slice(0, 220) : "No rel=canonical link was found." });
  findings.push({ id: "h1", title: "H1 heading", status: headings.h1 === 1 ? "pass" : "warning", detail: "Found " + headings.h1 + " H1 heading(s) and " + headings.h2 + " H2 heading(s)." });
  findings.push({ id: "images-alt", title: "Image alternative text", status: missingAlt === 0 ? "pass" : "warning", detail: images.length === 0 ? "No HTML images were found." : missingAlt + " of " + images.length + " image(s) have missing or empty alt text." });
  findings.push({ id: "links", title: "HTML links", status: internalLinks > 0 ? "pass" : "warning", detail: internalLinks + " internal, " + externalLinks + " external link(s)" + (linksWithoutHref ? "; " + linksWithoutHref + " anchor(s) without href" : "") + "." });
  findings.push({ id: "robots", title: "Robots directive", status: /noindex/i.test(robots) ? "warning" : "pass", detail: !robots ? "No meta robots directive was found; HTTP headers were not inspected." : "Meta robots: " + robots.slice(0, 180) + "." });

  const viewport = tags.some((tag) => (attributes(tag).name || "").toLowerCase() === "viewport");
  findings.push({ id: "viewport", title: "Mobile viewport", status: viewport ? "pass" : "warning", detail: viewport ? "A viewport meta tag was found. This does not verify responsive layout behavior." : "No viewport meta tag was found in the HTML." });

  const ogTitle = tags.some((tag) => (attributes(tag).property || "").toLowerCase() === "og:title" && Boolean(attributes(tag).content));
  const ogDescription = tags.some((tag) => (attributes(tag).property || "").toLowerCase() === "og:description" && Boolean(attributes(tag).content));
  const ogImage = tags.some((tag) => (attributes(tag).property || "").toLowerCase() === "og:image" && Boolean(attributes(tag).content));
  const socialMissing = [ogTitle, ogDescription, ogImage].filter((value) => !value).length;
  findings.push({ id: "open-graph", title: "Open Graph metadata", status: socialMissing === 0 ? "pass" : "warning", detail: (3 - socialMissing) + " of 3 checked tags found (og:title, og:description, og:image)." });

  const canonicals = linkTags.filter((tag) => {
    const attrs = attributes(tag);
    return (attrs.rel || "").toLowerCase().split(/\s+/).includes("canonical") && Boolean(attrs.href);
  });
  findings.push({ id: "canonical-count", title: "Canonical consistency", status: canonicals.length > 1 ? "warning" : "pass", detail: canonicals.length > 1 ? "Multiple canonical link elements were found; inspect them for conflicting URLs." : canonicals.length === 1 ? "Exactly one canonical link element was found." : "No canonical link was found; review whether this page needs one." });

  const jsonLdScripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi))
    .filter((match) => /application\/ld\+json/i.test(attributes("<script " + match[1] + ">")["type"] || ""));
  let invalidJsonLd = 0;
  for (const match of jsonLdScripts) {
    try { JSON.parse(match[2].replace(/^\s*<!--|-->\s*$/g, "").trim()); }
    catch { invalidJsonLd += 1; }
  }
  findings.push({ id: "structured-data", title: "JSON-LD syntax", status: jsonLdScripts.length === 0 ? "warning" : invalidJsonLd ? "warning" : "pass", detail: jsonLdScripts.length === 0 ? "No JSON-LD script was found in the returned HTML." : invalidJsonLd ? invalidJsonLd + " JSON-LD block(s) could not be parsed as JSON." : jsonLdScripts.length + " JSON-LD block(s) parsed as JSON. Schema semantics and search-engine eligibility were not verified." });

  const h1Matches = Array.from(html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi));
  const emptyH1 = h1Matches.filter((match) => !cleanText(match[1])).length;
  findings.push({ id: "heading-content", title: "H1 content", status: headings.h1 > 0 && emptyH1 === 0 ? "pass" : "warning", detail: headings.h1 === 0 ? "No H1 element was found." : emptyH1 ? emptyH1 + " H1 element(s) have no readable text." : headings.h1 + " H1 element(s) contain readable text; heading hierarchy across the page was not fully evaluated." });
  return findings;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to run a technical audit." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json() as { url?: unknown };
    if (typeof body.url !== "string" || body.url.trim().length === 0 || body.url.length > 2_048) {
      return NextResponse.json({ error: "Enter a website URL up to 2,048 characters long." }, { status: 400 });
    }
    const initial = new URL(body.url.trim().includes("://") ? body.url.trim() : "https://" + body.url.trim());
    const fetched = await fetchPublicHtml(initial.toString());
    const findings = auditHtml(fetched.html, fetched.status, fetched.finalUrl);
    return NextResponse.json({
      url: fetched.finalUrl,
      status: fetched.status,
      checkedAt: new Date().toISOString(),
      findings,
      summary: {
        total: findings.length,
        passed: findings.filter((item) => item.status === "pass").length,
        warnings: findings.filter((item) => item.status === "warning").length,
        errors: findings.filter((item) => item.status === "error").length,
      },
      limitations: [
        "This is a bounded single-page HTML audit, not a full-site crawl.",
        "JavaScript-rendered content, HTTP response headers, robots.txt, and linked pages are not audited.",
        "Title and description character ranges are guidance, not ranking guarantees.",
        "Results are not saved because persistent project storage has not been connected.",
      ],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The audit could not be completed.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
