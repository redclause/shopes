"use client";

import { useEffect, useState } from "react";
import { LOCALES, LOCALE_STORAGE_KEY, getDirection } from "./languages";
import { TRANSLATED_CORE_LOCALES } from "./messages";
import styles from "./locale-switcher.module.css";

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      const initial = saved && LOCALES.some((item) => item.code === saved) ? saved : "en";
      setLocale(initial);
      document.documentElement.lang = initial;
      document.documentElement.dir = getDirection(initial);
    } catch {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  }, []);

  function changeLocale(code: string) {
    setLocale(code);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      // The current page can still update when persistence is unavailable.
    }
    document.documentElement.lang = code;
    document.documentElement.dir = getDirection(code);
    window.dispatchEvent(new CustomEvent("shopes:locale-change", { detail: { locale: code } }));
  }

  return (
    <label className={styles.control}>
      <span>Language / ენა</span>
      <select aria-label="Interface language" value={locale} onChange={(event) => changeLocale(event.target.value)}>
        {LOCALES.map((item) => {
          const translationStatus = TRANSLATED_CORE_LOCALES.includes(item.code)
            ? "core labels only"
            : "English fallback";
          return <option key={item.code} value={item.code}>{item.nativeName} — {item.englishName} · {translationStatus}</option>;
        })}
      </select>
      <small className={styles.note}>Interface translations are incomplete; some or most page text may remain in English.</small>
    </label>
  );
}
