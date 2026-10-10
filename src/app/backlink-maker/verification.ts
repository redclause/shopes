export type BacklinkEvidence = {
  anchorText: string;
  href: string;
  resolvedUrl: string;
  rel: string[];
  isNofollow: boolean;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x2f;/gi, "/")
    .replace(/&#47;/g, "/")
    .replace(/&#x([\da-f]{1,6});/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function attribute(tag: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp("(?:^|\\s)" + escaped + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i").exec(tag);
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

export function comparableUrl(value: string, base?: string): string | null {
  try {
    const url = base ? new URL(value, base) : new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) url.port = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

export function extractBacklinkEvidence(html: string, pageUrl: string, targetUrl: string): BacklinkEvidence | null {
  const expected = comparableUrl(targetUrl);
  if (!expected) return null;
  const links = html.match(/<a\b[^>]*>[\s\S]*?<\/a\s*>/gi) ?? [];
  for (const tag of links) {
    const href = attribute(tag.slice(0, tag.indexOf(">") + 1), "href");
    if (!href) continue;
    const resolvedUrl = comparableUrl(href, pageUrl);
    if (resolvedUrl !== expected) continue;
    const rel = (attribute(tag.slice(0, tag.indexOf(">") + 1), "rel") ?? "")
      .toLowerCase().split(/\s+/).filter(Boolean);
    const inner = tag.slice(tag.indexOf(">") + 1).replace(/<[^>]*>/g, " ");
    const anchorText = decodeHtml(inner).replace(/\s+/g, " ").trim().slice(0, 500);
    return { anchorText, href, resolvedUrl, rel, isNofollow: rel.some((token) => ["nofollow", "sponsored", "ugc"].includes(token)) };
  }
  return null;
}

export function extractCanonicalUrl(html: string, pageUrl: string): string | null {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of links) {
    const rel = (attribute(tag, "rel") ?? "").toLowerCase().split(/\s+/);
    if (!rel.includes("canonical")) continue;
    const href = attribute(tag, "href");
    if (!href) continue;
    return comparableUrl(href, pageUrl);
  }
  return null;
}
