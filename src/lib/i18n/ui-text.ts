import type { Locale } from "./languages";

/** Shopes currently ships an English-only interface. */
export function translateUiText(_locale: Locale | string, text: string): string {
  return text;
}

export function hasUiTextTranslation(locale: string, text: string): boolean {
  return locale === "en" && text.trim().length > 0;
}
