import test from "node:test";
import assert from "node:assert/strict";
import { extractPageEvidence, classifySubmissionPage, visibleText } from "../src/app/backlink-maker/submission-analysis.mjs";

test("extracts title, canonical URL, and a real guest-post form with fields", () => {
  const html = `<html><head><title>Write for us</title><link rel="canonical" href="/contribute"></head><body>
    <h1>Write for us</h1><p>Submit an article for editorial review.</p>
    <form action="/submit-article" method="post"><input name="name" required><input name="email" type="email">
    <input name="website_url" type="url"><textarea name="article"></textarea><button type="submit">Send</button></form>
  </body></html>`;
  const evidence = extractPageEvidence(html, "https://publisher.example/contribute");
  assert.equal(evidence.title, "Write for us");
  assert.equal(evidence.canonicalUrl, "https://publisher.example/contribute");
  assert.ok(evidence.intentEvidence.includes("guest_post"));
  assert.equal(evidence.forms[0].actionUrl, "https://publisher.example/submit-article");
  assert.equal(evidence.forms[0].method, "post");
  assert.ok(evidence.forms[0].fields.some((field) => field.name === "website_url"));
  assert.equal(classifySubmissionPage(evidence).classification, "endpoint_evidence_found");
  assert.equal(classifySubmissionPage(evidence).automationEligible, false);
});

test("a keyword link without an actual form is not an endpoint", () => {
  const evidence = extractPageEvidence("<title>Submit</title><p>Submit your site</p><a href='/submit'>Submit</a>", "https://directory.example/");
  assert.equal(classifySubmissionPage(evidence).classification, "candidate_discovered");
});

test("CAPTCHA and login signals prevent automatic eligibility", () => {
  const html = `<p>Write for us and submit an article.</p><div class="g-recaptcha"></div>
  <form action="/submit" method="post"><input name="article"><button>Submit</button></form>`;
  const evidence = extractPageEvidence(html, "https://publisher.example/write-for-us");
  assert.equal(classifySubmissionPage(evidence).classification, "manual_review_required");
  assert.equal(classifySubmissionPage(evidence).automationEligible, false);
});

test("robots restrictions require manual review", () => {
  const evidence = extractPageEvidence("<p>Submit your site</p><form action='/submit'><input name='website'></form>", "https://directory.example/submit");
  assert.equal(classifySubmissionPage(evidence, { robotsDisallow: true }).reason, "crawler_disallowed_by_robots");
});

test("scripts and styles do not create false visible intent evidence", () => {
  const html = "<script>Submit an article</script><style>.x{content:'write for us'}</style><p>Welcome</p>";
  assert.equal(visibleText(html), "Welcome");
  assert.deepEqual(extractPageEvidence(html, "https://example.com/").intentEvidence, []);
});
