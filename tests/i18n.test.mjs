import test from "node:test";
import assert from "node:assert/strict";
import { LOCALES, getDirection, getLocale } from "../src/lib/i18n/languages.ts";
import { hasFullCoreTranslation, translate } from "../src/lib/i18n/messages.ts";
import { hasUiTextTranslation, translateUiText } from "../src/lib/i18n/ui-text.ts";

test("locale picker contains only the four locales selected for full UI localization", () => {
  assert.equal(LOCALES.length, 4);
  assert.equal(new Set(LOCALES.map((locale) => locale.code)).size, 4);
  assert.deepEqual(LOCALES.map((locale) => locale.code), ["en", "es", "fr", "de"]);
  assert.equal(LOCALES[0].code, "en");
  for (const code of ["eo", "af", "ka", "fa", "ps", "uz", "ar", "ja"]) assert.equal(LOCALES.some((locale) => locale.code === code), false);
});

test("locale lookup falls back safely and exposes RTL direction", () => {
  assert.equal(getLocale("ka").code, "en");
  assert.equal(getLocale("not-a-locale").code, "en");
  assert.equal(getDirection("ar"), "rtl");
  assert.equal(getDirection("en"), "ltr");
});

test("core translation lookup uses translated copy when available and English fallback otherwise", () => {
  assert.equal(translate("eo", "home"), "Home");
  assert.equal(translate("es", "keywordResearch"), "Investigación de palabras clave");
  assert.equal(translate("eo", "home"), "Home");
  assert.equal(hasFullCoreTranslation("eo"), false);
});

test("locale persistence accepts supported locales and safely handles unavailable storage", async () => {
  const { readStoredLocale, persistLocale, applyLocaleToDocument } = await import("../src/lib/i18n/locale-state.ts");
  const values = new Map([["shopes-locale", "ar"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(readStoredLocale(storage), "ar");
  assert.equal(persistLocale(storage, "fr"), true);
  assert.equal(readStoredLocale(storage), "fr");
  assert.equal(persistLocale(storage, "ka"), false);
  assert.equal(persistLocale(storage, "not-a-locale"), false);
  assert.equal(readStoredLocale({ getItem: () => { throw new Error("blocked"); } }), "en");
  assert.equal(persistLocale({ setItem: () => { throw new Error("blocked"); } }, "fr"), false);
  const fakeDocument = { documentElement: { lang: "", dir: "" } };
  applyLocaleToDocument(fakeDocument, "ar");
  assert.deepEqual(fakeDocument.documentElement, { lang: "ar", dir: "rtl" });
});

test("translation coverage is explicit for every offered locale and never reported complete by fallback", () => {
  const untranslated = LOCALES.filter((locale) => !hasFullCoreTranslation(locale.code));
  assert.ok(untranslated.length > 0);
  for (const locale of untranslated) {
    assert.equal(hasFullCoreTranslation(locale.code), false);
  }
  assert.equal(hasFullCoreTranslation("eo"), false);
  assert.equal(translate("eo", "home"), "Home");
});

test("Keyword Research controls have localized labels in every translated core locale", () => {
  assert.equal(translate("fr", "generateIdeas"), "Générer des idées");
  assert.equal(translate("es", "seedKeyword"), "Palabra clave inicial o tema");
  assert.equal(translate("fr", "targetMarket"), "Marché cible");
  assert.equal(translate("de", "keywordLanguage"), "Keyword-Sprache");
  assert.equal(translate("ja", "exportCsv"), "CSVをエクスポート");
  assert.equal(hasFullCoreTranslation("es"), true);
});
\n\ntest("UI text translation covers key user-facing copy and reports missing phrases honestly", () => {\n  assert.equal(translateUiText("es", "Analyze store"), "Analizar tienda");\n  assert.equal(translateUiText("fr", "Analyze store"), "Analyser la boutique");\n  assert.equal(translateUiText("de", "Analyze store"), "Shop analysieren");\n  assert.equal(hasUiTextTranslation("es", "Analyze store"), true);\n  assert.equal(hasUiTextTranslation("es", "A phrase not yet translated"), false);\n  assert.equal(translateUiText("en", "A phrase not yet translated"), "A phrase not yet translated");\n});\n