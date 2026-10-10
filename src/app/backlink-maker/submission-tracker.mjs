export type LocalSubmissionStatus = "prepared" | "user-reported-submitted" | "backlink_verified" | "rejected";

export type LocalSubmissionRecord = {
  targetUrl: string;
  siteId?: string;
  status: LocalSubmissionStatus | string;
  verification?: { resolvedUrl?: string };
};

const VALID_STATUSES = new Set<LocalSubmissionStatus>([
  "prepared",
  "user-reported-submitted",
  "backlink_verified",
  "rejected",
]);

/** Normalize legacy browser records without treating a user report as proof. */
export function normalizeStoredStatus(record: Partial<LocalSubmissionRecord>): LocalSubmissionStatus {
  if (record.status === "backlink_verified" && record.verification?.resolvedUrl) return "backlink_verified";
  if (record.status === "submitted" || record.status === "user-reported-submitted") return "user-reported-submitted";
  if (record.status === "rejected") return "rejected";
  return "prepared";
}

/** Prevent repeat local tracking entries for the same target/site until rejected. */
export function hasActiveDuplicate<T extends LocalSubmissionRecord>(records: T[], targetUrl: string, siteId: string): boolean {
  return records.some((record) => record.targetUrl === targetUrl && record.siteId === siteId && record.status !== "rejected");
}

export function canReopenManualWorkflow(status: string): boolean {
  return status === "rejected";
}

export function submissionStatusLabel(status: string): string {
  switch (status) {
    case "prepared": return "Prepared — not submitted";
    case "user-reported-submitted": return "User-reported submission — unverified";
    case "backlink_verified": return "Backlink verified in page HTML";
    case "rejected": return "User-reported rejection";
    default: return "Prepared — not submitted";
  }
}
