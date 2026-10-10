import test from "node:test";
import assert from "node:assert/strict";
import { canReopenManualWorkflow, hasActiveDuplicate, normalizeStoredRecord, normalizeStoredStatus, submissionStatusLabel, verificationStatusLabel } from "../src/app/backlink-maker/submission-tracker.mjs";

const base = { targetUrl: "https://shopes.online/page", siteId: "example", status: "prepared" };

test("prevents duplicate active target/site records but permits a rejected record to be restarted", () => {
  assert.equal(hasActiveDuplicate([base], base.targetUrl, "example"), true);
  assert.equal(hasActiveDuplicate([base], base.targetUrl, "other"), false);
  assert.equal(hasActiveDuplicate([{ ...base, status: "rejected" }], base.targetUrl, "example"), false);
});

test("normalizes legacy submission statuses conservatively", () => {
  assert.equal(normalizeStoredStatus({ status: "submitted" }), "user-reported-submitted");
  assert.equal(normalizeStoredStatus({ status: "backlink_verified" }), "prepared");
  assert.equal(normalizeStoredStatus({ status: "backlink_verified", verification: { resolvedUrl: "https://shopes.online/page" } }), "prepared");
  assert.equal(normalizeStoredStatus({ status: "unknown" }), "prepared");
});

test("migrates legacy verified records into separate submission and verification states only when evidence exists", () => {
  const legacyVerified = normalizeStoredRecord({ ...base, status: "backlink_verified", verification: { resolvedUrl: "https://shopes.online/page" } });
  assert.equal(legacyVerified.status, "prepared");
  assert.equal(legacyVerified.submissionStatus, "prepared");
  assert.equal(legacyVerified.verificationStatus, "found");
  const noEvidence = normalizeStoredRecord({ ...base, status: "backlink_verified" });
  assert.equal(noEvidence.verificationStatus, "not-checked");
  assert.equal(normalizeStoredRecord({ ...base, status: "submitted" }).submissionStatus, "user-reported-submitted");
});

test("only rejected records can reopen the manual workflow", () => {
  assert.equal(canReopenManualWorkflow("rejected"), true);
  assert.equal(canReopenManualWorkflow("prepared"), false);
  assert.equal(canReopenManualWorkflow("user-reported-submitted"), false);
});

test("labels distinguish submission claims from independent verification", () => {
  assert.match(submissionStatusLabel("user-reported-submitted"), /unverified/);
  assert.match(verificationStatusLabel("found"), /independently verified/);
  assert.match(verificationStatusLabel("not-checked"), /Not checked/);
});
