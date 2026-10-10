import test from "node:test";
import assert from "node:assert/strict";
import { isPublicIpAddress, parsePublicHttpUrl } from "../src/lib/public-url.ts";

test("accepts ordinary public IPv4 and globally routable IPv6 addresses", () => {
  assert.equal(isPublicIpAddress("8.8.8.8"), true);
  assert.equal(isPublicIpAddress("2606:4700:4700::1111"), true);
});

test("rejects private, loopback, link-local, reserved, and documentation IPv4", () => {
  for (const address of ["127.0.0.1", "10.0.0.2", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "192.0.2.1", "198.51.100.2", "203.0.113.4", "224.0.0.1", "0.0.0.0"]) {
    assert.equal(isPublicIpAddress(address), false, address);
  }
});

test("rejects non-global IPv6 ranges and IPv4-mapped addresses", () => {
  for (const address of ["::1", "fe80::1", "fc00::1", "fd00::1", "::ffff:127.0.0.1", "2001:db8::1", "2002::1"]) {
    assert.equal(isPublicIpAddress(address), false, address);
  }
});

test("accepts only credential-free HTTP(S) URLs with public IP literals", () => {
  assert.equal(parsePublicHttpUrl("https://example.com/path").hostname, "example.com");
  for (const value of ["javascript:alert(1)", "file:///etc/passwd", "http://127.0.0.1/", "http://[::1]/", "http://user:pass@example.com/", "http://169.254.169.254/"]) {
    assert.throws(() => parsePublicHttpUrl(value), undefined, value);
  }
});
