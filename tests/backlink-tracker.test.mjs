import test from "node:test";
import assert from "node:assert/strict";
import { canReopenManualWorkflow, hasActiveDuplicate, normalizeStoredStatus, submissionStatusLabel } from "../src/app/backlink-maker/submission-tracker.mjs";

const base = { targetUrl: "https://shopes.online/page", siteId: "example", status: "prepared" };

test("prevents duplicate active target/site records but permits a rejected record to be restarted", () => {
  assert.equal(hasActiveDuplicate([base], base.targetUrl, "example"), true);
  assert.equal(hasActiveDuplicate([base], base.targetUrl, "other"), false);
  assert.equal(hasActiveDuplicate([{ ...base, status: "rejected" }], base.targetUrl, "example"), false);
});

test("normalizes legacy statuses without treating a reported submission as verified", () => {
  assert.equal(normalizeStoredStatus({ status: "submitted" }), "user-reported-submitted");
  assert.equal(normalizeStoredStatus({ status: "backlink_verified" }), "prepared");
  assert.equal(normalizeStoredStatus({ status: "backlink_verified", verification: { resolvedUrl: "https://shopes.online/page" } }), "backlink_verified");
  assert.equal(normalizeStoredStatus({ status: "unknown" }), "prepared");
});

test("only rejected records can reopen the manual workflow", () => {
  assert.equal(canReopenManualWorkflow("rejected"), true);
  assert.equal(canReopenManualWorkflow("prepared"), false);
  assert.equal(canReopenManualWorkflow("backlink_verified"), false);
});

test("status labels preserve the distinction between reports and verified HTML evidence", () => {
  assert.match(submissionStatusLabel("user-reported-submitted"), /unverified/);
  assert.match(submissionStatusLabel("backlink_verified"), /verified in page HTML/);
});
