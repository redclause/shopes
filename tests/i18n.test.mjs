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
