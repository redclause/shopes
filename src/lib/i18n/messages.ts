import type { Locale } from "./languages";

/** Shared strings used by the public site and workspace navigation. */
export type MessageKey = "language" | "home" | "blog" | "dashboard" | "keywordResearch" | "signIn" | "signOut" | "freeForever" | "search" | "settings" | "loading" | "save" | "cancel" | "back" | "next" | "previous" | "noPaidPlans" | "generateIdeas" | "seedKeyword" | "targetMarket" | "keywordLanguage" | "exportCsv" | "workspaceProjects" | "organizeTargetWebsites" | "filterFindings" | "allResults" | "passedChecks" | "saveInBrowser" | "exportJsonReport" | "priority" | "recommendedNextStep" | "saveSetLocally";

const EN: Record<MessageKey, string> = {
  language: "Language", home: "Home", blog: "Blog", dashboard: "Dashboard", keywordResearch: "Keyword Research",
  signIn: "Sign in", signOut: "Sign out", freeForever: "Free forever", search: "Search",
  settings: "Settings", loading: "Loading…", save: "Save", cancel: "Cancel", back: "Back",
  next: "Next", previous: "Previous", noPaidPlans: "No paid plans or upgrade fees.", generateIdeas: "Generate ideas", seedKeyword: "Seed keyword or topic", targetMarket: "Target market", keywordLanguage: "Keyword language", exportCsv: "Export CSV", workspaceProjects: "Your workspace projects", organizeTargetWebsites: "Organize target websites and review audit snapshots saved in this browser.", filterFindings: "Filter findings", allResults: "All results", passedChecks: "Passed checks", saveInBrowser: "Save in this browser", exportJsonReport: "Export JSON report", priority: "priority", recommendedNextStep: "Recommended next step:", saveSetLocally: "Save set locally"
};

export function translate(_locale: Locale | string, key: MessageKey): string { return EN[key]; }
export function hasFullCoreTranslation(code: string): boolean { return code === "en"; }
export const TRANSLATED_CORE_LOCALES = ["en"];
