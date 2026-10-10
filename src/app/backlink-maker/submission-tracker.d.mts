export type LocalSubmissionStatus = "prepared" | "user-reported-submitted" | "rejected";
export type LocalVerificationStatus = "not-checked" | "found" | "not-found" | "error" | "redirect";
export type LocalSubmissionRecord = {
  targetUrl: string;
  siteId?: string;
  status?: string;
  submissionStatus?: string;
  verificationStatus?: string;
  verification?: { resolvedUrl?: string };
};
export type ManualWorkflow = {
  mode: "manual" | "manual-paid";
  label: string;
  destination: string;
  requirements: string[];
  steps: string[];
  caution: string;
};
export function normalizeStoredStatus(record: Partial<LocalSubmissionRecord>): LocalSubmissionStatus;
export function normalizeStoredRecord<T extends Record<string, any>>(record: T): T & {
  status: LocalSubmissionStatus;
  submissionStatus: LocalSubmissionStatus;
  verificationStatus: LocalVerificationStatus;
};
export function hasActiveDuplicate<T extends LocalSubmissionRecord>(records: T[], targetUrl: string, siteId: string): boolean;
export function canReopenManualWorkflow(status: string): boolean;
export function submissionStatusLabel(status: string): string;
export function verificationStatusLabel(status: string): string;
export function getManualWorkflow(siteId: string): ManualWorkflow | null;
