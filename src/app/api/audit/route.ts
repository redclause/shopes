import { fetchPublicHtml } from "../../../lib/audit/cloudflare-transport";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Finding = {
  id: string;
  title: string;
  status: "pass" | "warning" | "error";
  detail: string;
};

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
