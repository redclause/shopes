/**
 * Evidence-based stage counts for the catalog audit.
 * Missing fields are deliberately false: legacy discovery records cannot be
 * promoted to submission or publication success by inference.
 */
export function summarizeAuditRecords(records = {}) {
  const values = Object.values(records);
  return {
    websitesDiscovered: values.length,
    submissionMethodsDetected: values.filter((record) => record.submissionMethodDetected === true || record.submissionEndpointVerified === true).length,
    submissionCapabilityConfirmed: values.filter((record) => record.submissionCapabilityConfirmed === true).length,
    submissionActuallyAttempted: values.filter((record) => record.submissionAttempted === true).length,
    submissionAcceptedOrPendingModeration: values.filter((record) => record.submissionAccepted === true || record.pendingModeration === true).length,
    publicationIndicatedButUnverified: values.filter((record) => record.publicationIndicated === true && record.publicationVerified !== true).length,
    publicBacklinksVerified: values.filter((record) => record.publicationVerified === true).length,
    auditErrors: values.filter((record) => record.checkResult === "audit_error" || record.classification === "unverified").length,
  };
}
