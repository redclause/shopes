import test from "node:test";
import assert from "node:assert/strict";
import { comparableUrl, extractBacklinkEvidence, extractCanonicalUrl } from "../src/app/backlink-maker/verification.ts";

test("matches absolute and relative links after normalizing trailing slash and fragment", () => {
  const html = '<a href="../resource/?ref=docs#section">Useful <strong>resource</strong></a>';
  const result = extractBacklinkEvidence(html, "https://directory.example.org/guides/page", "https://directory.example.org/resource?ref=docs");
  assert.ok(result);
  assert.equal(result.anchorText, "Useful resource");
  assert.equal(result.resolvedUrl, "https://directory.example.org/resource/?ref=docs");
  assert.deepEqual(result.rel, []);
  assert.equal(result.isNofollow, false);
});

test("detects nofollow, sponsored, and ugc rel tokens", () => {
  const html = '<a href="https://target.example/path" rel="ugc sponsored nofollow">Visit</a>';
  const result = extractBacklinkEvidence(html, "https://source.example/article", "https://target.example/path/");
  assert.ok(result);
  assert.equal(result.isNofollow, true);
  assert.deepEqual(result.rel, ["ugc", "sponsored", "nofollow"]);
});

test("does not report a different destination as a backlink", () => {
  const html = '<a href="https://target.example/path?campaign=other">Link</a>';
  assert.equal(extractBacklinkEvidence(html, "https://source.example/", "https://target.example/path"), null);
});

test("extracts canonical URL relative to the checked page", () => {
  const html = '<link rel="canonical" href="../article/">';
  assert.equal(extractCanonicalUrl(html, "https://source.example/category/page"), "https://source.example/article");
});

test("does not mistake script or comment text for a published anchor", () => {
  const html = `<script>const fake = '<a href="https://target.example/">fake</a>';</script><!-- <a href="https://target.example/">comment</a> -->`;
  assert.equal(extractBacklinkEvidence(html, "https://source.example/", "https://target.example/"), null);
});

test("rejects non-http URL schemes", () => {
  assert.equal(comparableUrl("javascript:alert(1)"), null);
  assert.equal(extractBacklinkEvidence('<a href="javascript:alert(1)">x</a>', "https://source.example/", "https://target.example/"), null);
});
