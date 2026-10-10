import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import type { ProductData } from "../../../lib/product-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MAX_HTML_BYTES = 5 * 1024 * 1024;
const HARD_MAX_HTML_BYTES = 10 * 1024 * 1024;
const configuredHtmlLimit = Number(process.env.SHOPES_PRODUCT_HTML_MAX_BYTES);
const MAX_HTML_BYTES = Number.isSafeInteger(configuredHtmlLimit) && configuredHtmlLimit > 0
  ? Math.min(configuredHtmlLimit, HARD_MAX_HTML_BYTES)
  : DEFAULT_MAX_HTML_BYTES;
const MAX_HTML_MB = (MAX_HTML_BYTES / (1024 * 1024)).toFixed(1);
const htmlLimitMessage = `The product page exceeds the configured HTML limit (${MAX_HTML_MB} MB). Set SHOPES_PRODUCT_HTML_MAX_BYTES to adjust it, up to 10 MB.`;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 5_000;
const USER_AGENT = "ShopesProductIntelligence/1.0 (+https://shopes.online)";

function isPublicIPv4(address: string): boolean {
  const p = address.split(".").map(Number);
  if (p.length !== 4 || p.some((v) => !Number.isInteger(v) || v < 0 || v > 255)) return false;
  const [a, b, c] = p;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)) || (b === 88 && c === 99))) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 192 && b === 31 && c === 196) return false;
  if (a === 192 && b === 52 && c === 193) return false;
  if (a === 192 && b === 175 && c === 48) return false;
  if (a === 192 && b === 0 && (c === 9 || c === 10)) return false;
  return true;
}

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIPv4(address);
  if (family !== 6) return false;
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:") || normalized === "::" || normalized === "::1") return false;
  if (!/^2[0-9a-f]{0,3}:/i.test(normalized)) return false;
  if (/^2001:db8:/i.test(normalized) || /^2001:0:/i.test(normalized)) return false;
  return true;
}

async function validateAndResolve(input: string): Promise<{ url: URL; address: string; family: number }> {
  const url = new URL(input);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP and HTTPS product URLs are supported.");
  if (url.username || url.password) throw new Error("URLs containing usernames or passwords are not allowed.");
  if (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) throw new Error("Only standard HTTP and HTTPS ports are allowed.");
  if (!url.hostname.includes(".") || url.hostname.length > 253 || url.hostname === "localhost" || /\.(local|internal|localhost)$/i.test(url.hostname) || isIP(url.hostname)) {
    throw new Error("Enter a public product-page domain, not a local host or IP address.");
  }
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) throw new Error("This hostname does not resolve exclusively to public IP addresses.");
  return { url, address: addresses[0].address, family: addresses[0].family };
}

function requestPage(target: URL, address: string, family: number): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const transport = target.protocol === "https:" ? httpsRequest : httpRequest;
    const pinnedLookup = (_hostname: string, options: { all?: boolean }, callback: (error: NodeJS.ErrnoException | null, address: string | { address: string; family: number }[], family?: number) => void) => {
      if (options.all) callback(null, [{ address, family }]);
      else callback(null, address, family);
    };
    const req = transport({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: target.pathname + target.search,
      method: "GET",
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml;q=0.9", "accept-encoding": "identity", connection: "close" },
      lookup: pinnedLookup as never,
      ...(target.protocol === "https:" ? { servername: target.hostname } : {}),
      agent: false,
    }, resolve);
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error("The product page request timed out.")));
    req.on("error", reject);
    req.end();
  });
}

async function fetchPublicHtml(input: string): Promise<{ html: string; status: number; finalUrl: string }> {
  let current = input;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const validated = await validateAndResolve(current);
    const response = await requestPage(validated.url, validated.address, validated.family);
    const status = response.statusCode || 0;
    if ([301, 302, 303, 307, 308].includes(status)) {
      const location = response.headers.location;
      response.destroy();
      if (!location || redirects === MAX_REDIRECTS) throw new Error("The product page redirected too many times.");
      current = new URL(location, validated.url).toString();
      continue;
    }
    const type = String(response.headers["content-type"] || "").toLowerCase();
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
      response.destroy();
      throw new Error("The URL did not return an HTML product page.");
    }
    const contentEncoding = String(response.headers["content-encoding"] || "identity").toLowerCase();
    if (contentEncoding !== "identity") {
      response.destroy();
      throw new Error("The product page returned compressed HTML that could not be safely processed.");
    }
    const contentLengthHeader = response.headers["content-length"];
    const length = contentLengthHeader === undefined ? undefined : Number(contentLengthHeader);
    if (length !== undefined && Number.isFinite(length) && length > MAX_HTML_BYTES) {
      response.destroy();
      throw new Error(htmlLimitMessage);
    }
    const chunks: Buffer[] = [];
    let bytes = 0;
    const html = await new Promise<string>((resolve, reject) => {
      response.on("data", (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.byteLength;
        if (bytes > MAX_HTML_BYTES) {
          response.destroy(new Error(htmlLimitMessage));
          return;
        }
        chunks.push(buffer);
      });
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      response.on("error", reject);
    });
    if (status < 200 || status >= 400) throw new Error("The product page returned HTTP " + status + ".");
    return { html, status, finalUrl: validated.url.toString() };
  }
  throw new Error("The product page redirected too many times.");
}

function attrs(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag)) !== null) result[match[1].toLowerCase()] = (match[2] ?? match[3] ?? match[4] ?? "").trim();
  return result;
}

function clean(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim();
}

function readProductJsonLd(html: string): Record<string, unknown> | null {
  const scripts = html.match(/<script\b[^>]*type\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>[\s\S]*?<\/script\s*>/gi) || [];
  for (const script of scripts) {
    const body = script.replace(/^<[\s\S]*?>/, "").replace(/<\/script\s*>$/i, "").trim();
    try {
      const root = JSON.parse(body) as unknown;
      const queue: unknown[] = Array.isArray(root) ? [...root] : [root];
      while (queue.length) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        if (Array.isArray(record["@graph"])) queue.push(...record["@graph"]);
        const type = record["@type"];
        if ((typeof type === "string" && type.toLowerCase().includes("product")) || (Array.isArray(type) && type.some((v) => typeof v === "string" && v.toLowerCase().includes("product")))) return record;
        if (Array.isArray(record.itemListElement)) queue.push(...record.itemListElement.map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>).item : null)));
      }
    } catch { /* Ignore invalid structured data; the page can still be inspected. */ }
  }
  return null;
}

function textValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (value && typeof value === "object" && "name" in value) return textValue((value as { name?: unknown }).name);
  return "";
}

function extractProduct(html: string, url: string): ProductData {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  const imageTags = html.match(/<img\b[^>]*>/gi) || [];
  const meta: Record<string, string> = {};
  for (const tag of metaTags) {
    const a = attrs(tag);
    const key = (a.property || a.name || a.itemprop || "").toLowerCase();
    if (key && a.content) meta[key] = a.content;
  }
  const schema = readProductJsonLd(html);
  const offersRaw = schema?.offers;
  const offer = Array.isArray(offersRaw) ? offersRaw[0] : offersRaw;
  const offerObj = offer && typeof offer === "object" ? offer as Record<string, unknown> : {};
  const aggregate = schema?.aggregateRating && typeof schema.aggregateRating === "object" ? schema.aggregateRating as Record<string, unknown> : {};
  const description = textValue(schema?.description) || meta.description || meta["og:description"] || meta["product:description"] || "";
  const title = textValue(schema?.name) || meta["og:title"] || clean(titleMatch?.[1] || "");
  const priceRaw = textValue(offerObj.price) || meta["product:price:amount"] || textValue(schema?.price);
  const parsedPrice = Number(priceRaw.replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3}(?:\D|$))/g, "").replace(",", "."));
  const currency = textValue(offerObj.priceCurrency) || meta["product:price:currency"] || "";
  const image = schema?.image;
  const schemaImages = Array.isArray(image) ? image.length : image ? 1 : 0;
  const imageCount = Math.max(imageTags.length, schemaImages);
  const imagesWithAlt = imageTags.filter((tag) => Boolean(attrs(tag).alt?.trim())).length;
  let canonical = "";
  for (const tag of linkTags) {
    const a = attrs(tag);
    if ((a.rel || "").toLowerCase().split(/\s+/).includes("canonical")) canonical = a.href || "";
  }
  const ratingValue = Number(textValue(aggregate.ratingValue) || meta["product:rating"] || "");
  const reviewCount = Number(textValue(aggregate.reviewCount) || textValue(aggregate.ratingCount) || meta["product:review_count"] || "");
  const availability = textValue(offerObj.availability) || "";
  const brand = textValue(schema?.brand) || "";
  const category = textValue(schema?.category) || "";
  return {
    url,
    title: title || undefined,
    description: description || undefined,
    price: Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : null,
    currency: currency || undefined,
    brand: brand || undefined,
    category: category || undefined,
    imageCount,
    imagesWithAlt,
    canonical: canonical || undefined,
    productSchema: Boolean(schema),
    availability: availability ? availability.split("/").pop() : undefined,
    rating: Number.isFinite(ratingValue) && ratingValue > 0 && ratingValue <= 5 ? ratingValue : undefined,
    reviewCount: Number.isFinite(reviewCount) && reviewCount >= 0 ? reviewCount : undefined,
    source: "url",
  };
}

async function analyzeUrl(value: unknown): Promise<ProductData> {
  if (typeof value !== "string" || !value.trim() || value.length > 2048) throw new Error("Enter a product URL up to 2,048 characters long.");
  const input = value.trim().includes("://") ? value.trim() : "https://" + value.trim();
  const fetched = await fetchPublicHtml(new URL(input).toString());
  return extractProduct(fetched.html, fetched.finalUrl);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in to analyze product pages." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const body = await request.json() as { url?: unknown; competitors?: unknown };
    if (!body.url) return NextResponse.json({ error: "Enter a product URL to analyze." }, { status: 400 });
    const product = await analyzeUrl(body.url);
    const competitorsInput = Array.isArray(body.competitors) ? body.competitors.slice(0, 2) : [];
    const competitors: ProductData[] = await Promise.all(competitorsInput.filter((candidate): candidate is string => typeof candidate === "string" && Boolean(candidate.trim())).map(async (candidate) => {
      try { return await analyzeUrl(candidate); }
      catch (error) { return { url: candidate, title: "Could not analyze competitor", description: error instanceof Error ? error.message : "Fetch failed", source: "url" as const }; }
    }));
    return NextResponse.json({
      product,
      competitors,
      checkedAt: new Date().toISOString(),
      method: "bounded-html-and-structured-data",
      limitations: [
        "This analysis reads one public HTML page and its embedded metadata/JSON-LD; it does not render JavaScript or crawl linked pages.",
        "No paid AI model or external search API is connected. Recommendations are deterministic, evidence-based rules, not generated AI advice.",
        "Competitors are user-supplied URLs, not verified top-performing market products. No external traffic or sales data is available.",
        "Review sentiment is not inferred from a numeric rating. Customer-review text is not fetched from external review platforms.",
      ],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product analysis could not be completed.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
