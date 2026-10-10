/** @typedef {"prepared" | "user-reported-submitted" | "rejected"} LocalSubmissionStatus */
/** @typedef {"not-checked" | "found" | "not-found" | "error" | "redirect"} LocalVerificationStatus */
/** @typedef {{ targetUrl: string, siteId?: string, status?: string, submissionStatus?: string, verificationStatus?: string, verification?: { resolvedUrl?: string } }} LocalSubmissionRecord */

/** @param {Partial<LocalSubmissionRecord>} record @returns {LocalSubmissionStatus} */
export function normalizeStoredStatus(record) {
  const status = record.submissionStatus || record.status;
  if (status === "submitted" || status === "user-reported-submitted") return "user-reported-submitted";
  if (status === "rejected") return "rejected";
  return "prepared";
}

/** Migrate old records to independent submission and verification states without inventing evidence. */
export function normalizeStoredRecord(record) {
  const legacyVerified = record.status === "backlink_verified";
  const hasEvidence = Boolean(record.verification && typeof record.verification.resolvedUrl === "string" && record.verification.resolvedUrl);
  const verificationStatus = ["found", "not-found", "error", "redirect"].includes(record.verificationStatus)
    ? record.verificationStatus
    : legacyVerified && hasEvidence ? "found" : "not-checked";
  return {
    ...record,
    status: normalizeStoredStatus(record),
    submissionStatus: normalizeStoredStatus(record),
    verificationStatus,
  };
}

/** @param {LocalSubmissionRecord[]} records @param {string} targetUrl @param {string} siteId */
export function hasActiveDuplicate(records, targetUrl, siteId) {
  return records.some((record) => record.targetUrl === targetUrl && record.siteId === siteId && normalizeStoredStatus(record) !== "rejected");
}

/** @param {string} status */
export function canReopenManualWorkflow(status) {
  return status === "rejected";
}

/** @param {string} status */
export function submissionStatusLabel(status) {
  switch (status) {
    case "prepared": return "Prepared — not submitted";
    case "user-reported-submitted": return "User-reported submission — unverified";
    case "rejected": return "User-reported rejection";
    default: return "Prepared — not submitted";
  }
}

/**
 * Site-specific assisted workflows based on the destination's public submission information.
 * These guides never submit forms, bypass access controls, or initiate payments.
 */
export function getManualWorkflow(siteId) {
  const workflows = {
    "mavtools-com": {
      mode: "manual",
      label: "MavTools — submit a tool",
      destination: "https://mavtools.com/list-my-tool",
      requirements: ["Tool or website URL", "Product name and description", "Relevant category and pricing details"],
      steps: ["Open the official tool-submission page.", "Complete the destination's form yourself; sign-in or human verification may be required.", "Save any confirmation and verify the public listing later."],
      caution: "Shopes does not submit the form or handle account credentials. Confirm current eligibility and terms on MavTools before proceeding.",
    },
    "monkeyaitools-com": {
      mode: "manual-paid",
      label: "Monkey AI Tools — paid directory submission",
      destination: "https://www.monkeyaitools.com/submit-tool",
      requirements: ["Tool or website URL", "Product name and description", "Category and supporting details"],
      steps: ["Review the current listing options and editorial rules.", "Decide independently whether the stated fee is acceptable.", "If you proceed, submit through the official page yourself and keep the confirmation."],
      caution: "The official page advertises paid listings (basic pricing was shown as a one-time fee). Shopes never purchases a listing or initiates payment; check the current price and terms directly.",
    },
  };
  return workflows[siteId] || null;
}

/** @param {string} status */
export function verificationStatusLabel(status) {
  switch (status) {
    case "found": return "Backlink independently verified";
    case "not-found": return "Backlink not found";
    case "redirect": return "Source page redirected";
    case "error": return "Verification failed";
    default: return "Not checked";
  }
}
