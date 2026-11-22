import { resolve4, resolve6 } from "node:dns/promises";
import { connect as tcpConnect, isIP } from "node:net";
import { connect as tlsConnect } from "node:tls";
import { Buffer } from "node:buffer";

// Workers runtime: node:dns lookup() and node:http pinned lookup callbacks
// are not implemented. Resolve all records, reject special-use addresses,
// then connect TLS/TCP DIRECTLY to the validated IP with SNI and certificate
// validation against the original hostname. No post-validation DNS lookup.
const MAX_HTML_BYTES = 1_000_000;
const MAX_TRANSFER_BYTES = 1_150_000;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8_000;
const USER_AGENT = "ShopesTechnicalAudit/1.0 (+https://shopes.online)";

export function isPublicIPv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [a, b, c, d] = address.split(".").map(Number);
  if ([a, b, c, d].some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || b === 0 || b === 88 && c === 99)) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 192 && b === 52 && c === 193) return false;
  if (a === 192 && b === 175 && c === 48) return false;
  if (a === 192 && b === 31 && c === 196) return false;
  if (a === 192 && b === 0 && (c === 2 || c === 9 || c === 10)) return false;
  return true;
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIPv4(address);
  if (family !== 6) return false;
  const value = address.toLowerCase();
  // The only externally routable IPv6 family we allow is global unicast 2000::/3.
  if (!/^[23][0-9a-f]{0,3}:/.test(value)) return false;
  // Protocol transition, documentation and special-use addresses.
  if (/^2001:(db8|0|2|10|20|3):/.test(value)) return false;
  if (/^2001:db8:/.test(value) || /^2001:0:/.test(value)) return false;
  if (value.startsWith("::ffff:") || value === "::" || value === "::1") return false;
  return true;
}

export function validateUrl(input: string): URL {
  let url: URL;
  try { url = new URL(input); }
  catch { throw new Error("Enter a valid absolute website URL, including https://."); }
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS website URLs are supported.");
  if (url.username || url.password) throw new Error("URLs containing usernames or passwords are not allowed.");
  if (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) throw new Error("Only standard HTTP and HTTPS ports are allowed.");
  if (url.hostname.length > 253 || !url.hostname.includes(".") || /\.(local|internal|localhost|test|invalid|example)$/i.test(url.hostname) || url.hostname === "localhost") throw new Error("Enter a public website hostname.");
  if (isIP(url.hostname) || url.hostname.startsWith("[") || /^\d+(?:\.\d+)*$/.test(url.hostname)) throw new Error("For safety, enter a public domain name rather than an IP address.");
  url.hash = "";
  return url;
}

type VerifiedTarget = { url: URL; ip: string; family: number; allCloudflare: boolean };

// Cloudflare's TCP sockets explicitly cannot reach Cloudflare IP ranges. Such
// targets use native fetch ONLY after both IPv4 and IPv6 DNS answers pass the
// public-address policy and ALL records are verified as Cloudflare edge IPs.
// Native Workers fetch also enforces the platform's restricted network egress.
// Redirects are ALWAYS manual and revalidated. Normal sites use pinned sockets.
const CF_IPV4 = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22",
  "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18",
  "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22",
  "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
  "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
];
const CF_IPV6 = ["2400:cb00:", "2606:4700:", "2803:f800:", "2405:b500:", "2405:8100:", "2a06:98c0:", "2c0f:f248:"];

function inIpv4Cidr(address: string, cidr: string): boolean {
  const [subnet, maskText] = cidr.split("/");
  const bits = Number(maskText);
  const octets = (s: string) => s.split(".").reduce((n, v) => ((n << 8) | Number(v)) >>> 0, 0);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (octets(address) & mask) === (octets(subnet) & mask);
}
function isCloudflareIp(address: string): boolean {
  if (isIP(address) === 4) return CF_IPV4.some((cidr) => inIpv4Cidr(address, cidr));
  return CF_IPV6.some((prefix) => address.toLowerCase().startsWith(prefix));
}

async function resolvePublicTarget(input: string): Promise<VerifiedTarget> {
  const url = validateUrl(input);
  const [v4, v6] = await Promise.allSettled([resolve4(url.hostname), resolve6(url.hostname)]);
  const four = v4.status === "fulfilled" ? v4.value : [];
  const six = v6.status === "fulfilled" ? v6.value : [];
  const addresses = [...four, ...six];
  if (!addresses.length || addresses.some((ip) => !isPublicAddress(ip))) {
    throw new Error("This hostname does not resolve exclusively to public IP addresses.");
  }
  return { url, ip: four[0] || six[0], family: four.length ? 4 : 6, allCloudflare: addresses.every(isCloudflareIp) };
}

type HttpResult = { status: number; headers: Record<string, string>; body: Buffer };
function decodeChunked(buffer: Buffer): Buffer {
  const blocks: Buffer[] = [];
  let cursor = 0, total = 0;
  for (;;) {
    const end = buffer.indexOf("\r\n", cursor, "utf8");
    if (end < 0 || end - cursor > 32) throw new Error("Invalid chunked HTTP response.");
    const sizeString = buffer.toString("ascii", cursor, end).split(";")[0];
    if (!/^[0-9a-f]+$/i.test(sizeString)) throw new Error("Invalid HTTP chunk length.");
    const size = parseInt(sizeString, 16);
    cursor = end + 2;
    if (size === 0) break;
    if (size > MAX_HTML_BYTES - total || cursor + size + 2 > buffer.length) throw new Error("The HTML document exceeds the 1 MB audit limit or response is incomplete.");
    blocks.push(buffer.subarray(cursor, cursor + size));
    total += size;
    cursor += size;
    if (buffer[cursor] !== 13 || buffer[cursor + 1] !== 10) throw new Error("Invalid HTTP chunk termination.");
    cursor += 2;
  }
  return Buffer.concat(blocks);
}
function parseHttpResponse(bytes: Buffer): HttpResult {
  const sep = bytes.indexOf("\r\n\r\n");
  if (sep < 0 || sep > 16_384) throw new Error("Invalid or oversized HTTP response headers.");
  const headerLines = bytes.toString("latin1", 0, sep).split("\r\n");
  const statusMatch = /^HTTP\/1\.[01] (\d{3})\b/.exec(headerLines.shift() || "");
  if (!statusMatch) throw new Error("Expected an HTTP/1.1 response.");
  const headers: Record<string, string> = {};
  for (const line of headerLines) {
    const index = line.indexOf(":");
    if (index > 0) headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
  }
  if (headers["content-encoding"] && headers["content-encoding"] !== "identity") throw new Error("Compressed HTML responses are not supported.");
  const raw = bytes.subarray(sep + 4);
  const body = /\bchunked\b/i.test(headers["transfer-encoding"] || "") ? decodeChunked(raw) : raw;
  if (body.length > MAX_HTML_BYTES) throw new Error("The HTML document exceeds the 1 MB audit limit.");
  return { status: Number(statusMatch[1]), headers, body };
}

async function pinnedRequest(target: VerifiedTarget): Promise<HttpResult> {
  return new Promise<HttpResult>((resolve, reject) => {
    let finished = false;
    const finish = (error?: Error, result?: HttpResult) => {
      if (finished) return;
      finished = true;
      if (error) reject(error);
      else if (result) resolve(result);
    };
    const socket = target.url.protocol === "https:"
      ? tlsConnect({ host: target.ip, port: 443, servername: target.url.hostname, rejectUnauthorized: true })
      : tcpConnect({ host: target.ip, port: 80 });
    const pieces: Buffer[] = [];
    let bytes = 0;
    socket.setTimeout(TIMEOUT_MS, () => socket.destroy(new Error("The website request timed out.")));
    socket.on("error", (error) => finish(error instanceof Error ? error : new Error("Connection failed.")));
    socket.on("data", (chunk: Buffer | string) => {
      const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytes += part.length;
      if (bytes > MAX_TRANSFER_BYTES) {
        socket.destroy(new Error("The HTML document exceeds the 1 MB audit limit."));
        return;
      }
      pieces.push(part);
    });
    socket.on("end", () => {
      try { finish(undefined, parseHttpResponse(Buffer.concat(pieces))); }
      catch (error) { finish(error instanceof Error ? error : new Error("Invalid HTTP response.")); }
    });
    socket.on("close", () => { if (!finished) finish(new Error("The remote server closed the connection before completing a response.")); });
    const send = () => {
      if (target.url.protocol === "https:" && !("authorized" in socket && socket.authorized)) {
        socket.destroy(new Error("The website TLS certificate could not be validated."));
        return;
      }
      const path = target.url.pathname + target.url.search;
      socket.write("GET " + path + " HTTP/1.1\r\n" +
        "Host: " + target.url.host + "\r\n" +
        "User-Agent: " + USER_AGENT + "\r\n" +
        "Accept: text/html,application/xhtml+xml;q=0.9\r\n" +
        "Accept-Encoding: identity\r\n" +
        "Connection: close\r\n\r\n");
    };
    if (target.url.protocol === "https:") socket.once("secureConnect", send);
    else socket.once("connect", send);
  });
}

async function cloudflareFetch(target: VerifiedTarget): Promise<HttpResult> {
  const response = await fetch(target.url, {
    method: "GET",
    redirect: "manual",
    cache: "no-store",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml;q=0.9",
      "Accept-Encoding": "identity",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const rawLength = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(rawLength) && rawLength > MAX_HTML_BYTES) {
    await response.body?.cancel();
    throw new Error("The HTML document exceeds the 1 MB audit limit.");
  }
  const parts: Uint8Array[] = [];
  const reader = response.body?.getReader();
  let bytes = 0;
  if (reader) {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_HTML_BYTES) throw new Error("The HTML document exceeds the 1 MB audit limit.");
        parts.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
  }
  const headers: Record<string, string> = {};
  for (const [key, value] of response.headers) headers[key.toLowerCase()] = value;
  return { status: response.status, headers, body: Buffer.concat(parts.map((b) => Buffer.from(b))) };
}

export async function fetchPublicHtml(input: string): Promise<{ html: string; status: number; finalUrl: string; contentType: string }> {
  let current = input;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const target = await resolvePublicTarget(current);
    const result = target.allCloudflare ? await cloudflareFetch(target) : await pinnedRequest(target);
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      if (!result.headers.location || redirects === MAX_REDIRECTS) throw new Error("The website redirected too many times or returned an invalid redirect.");
      current = new URL(result.headers.location, target.url).toString();
      continue;
    }
    const contentType = String(result.headers["content-type"] || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("The URL did not return an HTML page, so a technical HTML audit could not be completed.");
    }
    if (result.body.length > MAX_HTML_BYTES) throw new Error("The HTML document exceeds the 1 MB audit limit.");
    return { html: result.body.toString("utf8"), status: result.status, finalUrl: target.url.toString(), contentType };
  }
  throw new Error("The website redirected too many times.");
}
