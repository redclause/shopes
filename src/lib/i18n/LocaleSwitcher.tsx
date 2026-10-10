"use client";

import { useEffect, useState } from "react";
import { LOCALES } from "./languages";
import { applyLocaleToDocument, persistLocale, readStoredLocale } from "./locale-state";
import { TRANSLATED_CORE_LOCALES } from "./messages";
import styles from "./locale-switcher.module.css";

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const initial = readStoredLocale(window.localStorage);
    setLocale(initial);
    applyLocaleToDocument(document, initial);
  }, []);

  function changeLocale(code: string) {
    setLocale(code);
    persistLocale(window.localStorage, code);
    applyLocaleToDocument(document, code);
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
