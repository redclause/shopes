export type Locale = { code: string; englishName: string; nativeName: string; direction?: "rtl" };

export const LOCALES: Locale[] = [{ code: "en", englishName: "English", nativeName: "English" }];
export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "shopes-locale";
export function getLocale(code?: string | null): Locale { void code; return LOCALES[0]; }
export function getDirection(code: string): "ltr" | "rtl" { void code; return "ltr"; }
