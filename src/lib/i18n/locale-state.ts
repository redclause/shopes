import { DEFAULT_LOCALE, getDirection, getLocale, LOCALES, LOCALE_STORAGE_KEY } from "./languages";

export type LocaleStorage = Pick<Storage, "getItem" | "setItem">;
export type LocaleDocument = Pick<Document, "documentElement">;

export function resolveStoredLocale(value: string | null | undefined): string {
  return LOCALES.some((locale) => locale.code === value) ? value as string : DEFAULT_LOCALE;
}

export function readStoredLocale(storage: Pick<LocaleStorage, "getItem">): string {
  try {
    return resolveStoredLocale(storage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function persistLocale(storage: Pick<LocaleStorage, "setItem">, code: string): boolean {
  if (!LOCALES.some((locale) => locale.code === code)) return false;
  try {
    storage.setItem(LOCALE_STORAGE_KEY, code);
    return true;
  } catch {
    return false;
  }
}

export function applyLocaleToDocument(documentLike: LocaleDocument, code: string): void {
  const locale = getLocale(code);
  documentLike.documentElement.lang = locale.code;
  documentLike.documentElement.dir = getDirection(locale.code);
}
