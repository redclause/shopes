export type LocalSubmissionStatus = "prepared" | "user-reported-submitted" | "backlink_verified" | "rejected";
export type LocalSubmissionRecord = { targetUrl: string; siteId?: string; status: LocalSubmissionStatus | string; verification?: { resolvedUrl?: string } };
export function normalizeStoredStatus(record: Partial<LocalSubmissionRecord>): LocalSubmissionStatus;
export function hasActiveDuplicate<T extends LocalSubmissionRecord>(records: T[], targetUrl: string, siteId: string): boolean;
export function canReopenManualWorkflow(status: string): boolean;
export function submissionStatusLabel(status: string): string;
