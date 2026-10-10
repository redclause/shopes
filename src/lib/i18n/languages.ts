export type Locale = { code: string; englishName: string; nativeName: string; direction?: "rtl" };

export const LOCALES: Locale[] = [
  { code: "en", englishName: "English", nativeName: "English" },
  { code: "es", englishName: "Spanish", nativeName: "Español" },
  { code: "fr", englishName: "French", nativeName: "Français" },
  { code: "de", englishName: "German", nativeName: "Deutsch" }
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "shopes-locale";

export function getLocale(code: string | null | undefined): Locale {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES[0];
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocale(code).direction ?? "ltr";
}
