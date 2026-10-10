"use client";

import { useEffect, useState } from "react";
import { LOCALES } from "./languages";
import { applyLocaleToDocument, persistLocale, readStoredLocale } from "./locale-state";
import { TRANSLATED_CORE_LOCALES, translate } from "./messages";
import styles from "./locale-switcher.module.css";

const KEYWORD_RULE_LOCALES = new Set(["en", "ka", "es", "fr", "de", "pt", "it", "nl", "ru", "uk", "tr", "ar", "hi", "zh", "zh-TW", "ja", "ko", "id", "vi", "pl", "sv"]);

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
    document.cookie = "shopes-locale=" + encodeURIComponent(code) + "; path=/; max-age=31536000; SameSite=Lax";
    applyLocaleToDocument(document, code);
    window.dispatchEvent(new CustomEvent("shopes:locale-change", { detail: { locale: code } }));
  }

  return (
    <label className={styles.control}>
      <span>{translate(locale, "language")}</span>
      <select aria-label="Interface language" value={locale} onChange={(event) => changeLocale(event.target.value)}>
        {LOCALES.map((item) => {
          const coreStatus = TRANSLATED_CORE_LOCALES.includes(item.code) ? "core labels translated" : "English UI fallback";
          const keywordStatus = KEYWORD_RULE_LOCALES.has(item.code) ? "keyword rules available" : "no keyword rules";
          return <option key={item.code} value={item.code}>{item.nativeName} — {item.englishName} · {coreStatus} · {keywordStatus}</option>;
        })}
      </select>
      <small className={styles.note}>Interface translations are incomplete; some or most page text may remain in English.</small>
    </label>
  );
}
