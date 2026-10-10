/** @typedef {"prepared" | "user-reported-submitted" | "backlink_verified" | "rejected"} LocalSubmissionStatus */
/** @typedef {{ targetUrl: string, siteId?: string, status: string, verification?: { resolvedUrl?: string } }} LocalSubmissionRecord */

/** @param {Partial<LocalSubmissionRecord>} record @returns {LocalSubmissionStatus} */
export function normalizeStoredStatus(record) {
  if (record.status === "backlink_verified" && record.verification?.resolvedUrl) return "backlink_verified";
  if (record.status === "submitted" || record.status === "user-reported-submitted") return "user-reported-submitted";
  if (record.status === "rejected") return "rejected";
  return "prepared";
}

/** @param {LocalSubmissionRecord[]} records @param {string} targetUrl @param {string} siteId */
export function hasActiveDuplicate(records, targetUrl, siteId) {
  return records.some((record) => record.targetUrl === targetUrl && record.siteId === siteId && record.status !== "rejected");
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
    case "backlink_verified": return "Backlink verified in page HTML";
    case "rejected": return "User-reported rejection";
    default: return "Prepared — not submitted";
  }
}
