import test from "node:test";
import assert from "node:assert/strict";
import {
  isPublicAddress,
  isPublicIPv4,
  validateUrl,
  fetchPublicHtml,
} from "../src/lib/audit/cloudflare-transport.ts";

test("public-IP guard denies private, loopback, CGNAT, link-local and documentation", () => {
  const denied = [
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255",
    "192.168.0.1", "169.254.169.254", "100.64.0.1",
    "0.0.0.0", "192.0.2.1", "198.51.100.15", "203.0.113.4",
    "224.0.0.1", "255.255.255.255", "192.0.0.9",
  ];
  for (const ip of denied) assert.equal(isPublicIPv4(ip), false, ip);
  assert.equal(isPublicIPv4("1.1.1.1"), true);
  assert.equal(isPublicIPv4("8.8.8.8"), true);
  assert.equal(isPublicAddress("::1"), false);
  assert.equal(isPublicAddress("fc00::1"), false);
  assert.equal(isPublicAddress("fe80::1"), false);
  assert.equal(isPublicAddress("2001:db8::1"), false);
  assert.equal(isPublicAddress("::ffff:127.0.0.1"), false);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});

test("URL validator blocks SSRF vectors and non-standard ports", () => {
  const denied = [
    "http://127.0.0.1/", "http://127.1/", "http://0x7f000001/",
    "https://[::1]/", "http://169.254.169.254/latest/meta-data",
    "http://localhost", "http://foo.local", "http://bar.internal",
    "http://example.com:8080", "https://example.com:444",
    "ftp://example.com", "file:///etc/passwd", "http://me:password@example.com",
    "https://foo.example", "http://foo.test", "https://foo.invalid",
    "https://192.168.1.1",
  ];
  for (const url of denied) assert.throws(() => validateUrl(url), undefined, url);
  assert.equal(validateUrl("https://imageto.one/#ignored").href, "https://imageto.one/");
  assert.equal(validateUrl("https://example.com:443/path").hostname, "example.com");
});

test("bounded public HTML retrieval works for a Cloudflare-hosted website", async () => {
  const result = await fetchPublicHtml("https://imageto.one");
  assert.equal(result.status, 200);
  assert.match(result.contentType, /text\/html/);
  assert.ok(result.html.includes("<html"), "HTML document returned");
  assert.equal(result.finalUrl, "https://imageto.one/");
});

test("a normal HTTPS website audit uses verified transport", async () => {
  const result = await fetchPublicHtml("https://example.org");
  assert.equal(result.status, 200);
  assert.match(result.contentType, /text\/html/);
  assert.ok(result.html.length > 100);
});
