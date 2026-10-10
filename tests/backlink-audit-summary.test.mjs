import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAuditRecords } from "../src/app/backlink-maker/audit-summary.mjs";

test("discovery and detected forms never count as submission or publication", () => {
  const result = summarizeAuditRecords({
    a: { classification: "candidate_discovered" },
    b: { submissionEndpointVerified: true, classification: "submission_method_detected_unapproved" },
  });
  assert.equal(result.websitesDiscovered, 2);
  assert.equal(result.submissionMethodsDetected, 1);
  assert.equal(result.submissionCapabilityConfirmed, 0);
  assert.equal(result.submissionActuallyAttempted, 0);
  assert.equal(result.publicBacklinksVerified, 0);
});

test("counts actual stage flags independently and conservatively", () => {
  const result = summarizeAuditRecords({
    a: { submissionCapabilityConfirmed: true, submissionAttempted: true, submissionAccepted: true },
    b: { pendingModeration: true, publicationIndicated: true },
    c: { publicationIndicated: true, publicationVerified: true },
    d: { checkResult: "audit_error" },
  });
  assert.equal(result.submissionCapabilityConfirmed, 1);
  assert.equal(result.submissionActuallyAttempted, 1);
  assert.equal(result.submissionAcceptedOrPendingModeration, 2);
  assert.equal(result.publicationIndicatedButUnverified, 1);
  assert.equal(result.publicBacklinksVerified, 1);
  assert.equal(result.auditErrors, 1);
});

test("empty or legacy records default to zero confirmed outcomes", () => {
  const result = summarizeAuditRecords({ old: { automationVerified: false } });
  assert.equal(result.websitesDiscovered, 1);
  assert.equal(result.submissionCapabilityConfirmed, 0);
  assert.equal(result.publicBacklinksVerified, 0);
});
