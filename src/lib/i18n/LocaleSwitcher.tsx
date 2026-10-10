"use client";

import { useEffect, useState } from "react";
import { LOCALES, LOCALE_STORAGE_KEY, getDirection } from "./languages";
import styles from "./locale-switcher.module.css";

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && LOCALES.some((item) => item.code === saved)) setLocale(saved);
    } catch {
      // Storage can be disabled; English remains a safe default.
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
        {LOCALES.map((item) => <option key={item.code} value={item.code}>{item.nativeName} — {item.englishName}</option>)}
      </select>
    </label>
  );
}
