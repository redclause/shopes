"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "./languages";
import { translate, type MessageKey } from "./messages";

export function useShopesTranslation() {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved) setLocale(saved);
    } catch {
      setLocale(DEFAULT_LOCALE);
    }
    const onLocaleChange = (event: Event) => {
      const custom = event as CustomEvent<{ locale?: string }>;
      if (custom.detail?.locale) setLocale(custom.detail.locale);
    };
    window.addEventListener("shopes:locale-change", onLocaleChange);
    return () => window.removeEventListener("shopes:locale-change", onLocaleChange);
  }, []);
  return {
    locale,
    t: (key: MessageKey) => translate(locale, key),
  };
}
