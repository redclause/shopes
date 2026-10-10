import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPublicIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 0 && c === 2) || (b === 88 && c === 99) || (b === 0 && c === 0))) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 255 && b === 255 && c === 255) return false;
  return true;
}

function isPublicIpv6(address: string): boolean {
  const ip = address.toLowerCase().split("%")[0];
  // Only globally routable 2000::/3 addresses are eligible. This deliberately
  // rejects loopback, link-local, ULA, IPv4-mapped, documentation, and other
  // special-purpose IPv6 ranges rather than trying to enumerate every exception.
  if (!/^2[0-9a-f]{3}:/.test(ip)) return false;
  if (ip.startsWith("2001:db8:") || ip.startsWith("2001:10:") || ip.startsWith("2001:20:")) return false;
  if (ip.startsWith("2002:")) return false;
  return true;
}

export function isPublicIpAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPublicIpv4(address);
  if (version === 6) return isPublicIpv6(address);
  return false;
}

export function parsePublicHttpUrl(value: unknown): URL {
  if (typeof value !== "string" || value.length > 2048) throw new Error("Enter a valid public URL.");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid public URL."); }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (url.username || url.password) throw new Error("URLs containing credentials are not supported.");
  const hostname = url.hostname.toLowerCase().replace(/^\\[|\\]$/g, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "metadata.google.internal") {
    throw new Error("Private or local addresses cannot be checked.");
  }
  if (isIP(hostname) && !isPublicIpAddress(hostname)) throw new Error("Private or reserved IP addresses cannot be checked.");
  return url;
}

export async function assertPublicHttpUrl(value: unknown): Promise<URL> {
  const url = parsePublicHttpUrl(value);
  const hostname = url.hostname.replace(/^\\[|\\]$/g, "");
  if (!isIP(hostname)) {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => !isPublicIpAddress(address))) {
      throw new Error("The hostname must resolve exclusively to public IP addresses.");
    }
  }
  return url;
}
