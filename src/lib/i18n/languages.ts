export type Locale = { code: string; englishName: string; nativeName: string; direction?: "rtl" };

export const LOCALES: Locale[] = [{ code: "en", englishName: "English", nativeName: "English" }];
export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "shopes-locale";
export function getLocale(_code?: string | null): Locale { return LOCALES[0]; }
export function getDirection(_code: string): "ltr" | "rtl" { return "ltr"; }
