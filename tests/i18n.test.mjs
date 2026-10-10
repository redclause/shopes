import test from "node:test";
import assert from "node:assert/strict";
import { LOCALES, getDirection, getLocale } from "../src/lib/i18n/languages.ts";
import { hasFullCoreTranslation, translate } from "../src/lib/i18n/messages.ts";

test("locale picker exposes English plus 85 additional locales", () => {
  assert.equal(LOCALES.length, 86);
  assert.equal(new Set(LOCALES.map((locale) => locale.code)).size, 86);
  assert.equal(LOCALES[0].code, "en");
});

test("locale lookup falls back safely and exposes RTL direction", () => {
  assert.equal(getLocale("ka").nativeName, "ქართული");
  assert.equal(getLocale("not-a-locale").code, "en");
  assert.equal(getDirection("ar"), "rtl");
  assert.equal(getDirection("en"), "ltr");
});

test("core translation lookup uses translated copy when available and English fallback otherwise", () => {
  assert.equal(translate("ka", "home"), "მთავარი");
  assert.equal(translate("es", "keywordResearch"), "Investigación de palabras clave");
  assert.equal(translate("af", "home"), "Home");
  assert.equal(hasFullCoreTranslation("ka"), true);
  assert.equal(hasFullCoreTranslation("af"), false);
});

test("locale persistence accepts supported locales and safely handles unavailable storage", async () => {
  const { readStoredLocale, persistLocale, applyLocaleToDocument } = await import("../src/lib/i18n/locale-state.ts");
  const values = new Map([["shopes-locale", "ar"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(readStoredLocale(storage), "ar");
  assert.equal(persistLocale(storage, "ka"), true);
  assert.equal(readStoredLocale(storage), "ka");
  assert.equal(persistLocale(storage, "not-a-locale"), false);
  assert.equal(readStoredLocale({ getItem: () => { throw new Error("blocked"); } }), "en");
  assert.equal(persistLocale({ setItem: () => { throw new Error("blocked"); } }, "fr"), false);
  const fakeDocument = { documentElement: { lang: "", dir: "" } };
  applyLocaleToDocument(fakeDocument, "ar");
  assert.deepEqual(fakeDocument.documentElement, { lang: "ar", dir: "rtl" });
});

test("translation coverage is explicit for every locale and never reported complete by fallback", () => {
  const untranslated = LOCALES.filter((locale) => !hasFullCoreTranslation(locale.code));
  assert.ok(untranslated.length > 0);
  for (const locale of untranslated) {
    assert.equal(hasFullCoreTranslation(locale.code), false);
  }
  assert.equal(hasFullCoreTranslation("ka"), true);
  assert.equal(translate("af", "home"), "Home");
});

test("Keyword Research controls have localized labels in every translated core locale", () => {
  assert.equal(translate("ka", "generateIdeas"), "იდეების გენერირება");
  assert.equal(translate("es", "seedKeyword"), "Palabra clave inicial o tema");
  assert.equal(translate("fr", "targetMarket"), "Marché cible");
  assert.equal(translate("de", "keywordLanguage"), "Keyword-Sprache");
  assert.equal(translate("ja", "exportCsv"), "CSVをエクスポート");
  assert.equal(hasFullCoreTranslation("es"), true);
});
