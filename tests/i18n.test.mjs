import test from "node:test";
import assert from "node:assert/strict";
import { LOCALES, getDirection, getLocale } from "../src/lib/i18n/languages.ts";
import { hasFullCoreTranslation, translate } from "../src/lib/i18n/messages.ts";
import { hasUiTextTranslation, translateUiText } from "../src/lib/i18n/ui-text.ts";

test("Shopes exposes English only", () => {
  assert.deepEqual(LOCALES.map((locale) => locale.code), ["en"]);
  assert.equal(getLocale("es").code, "en");
  assert.equal(getLocale("fr").code, "en");
  assert.equal(getLocale("de").code, "en");
  assert.equal(getDirection("en"), "ltr");
});

test("shared labels always use English copy", () => {
  assert.equal(translate("en", "keywordResearch"), "Keyword Research");
  assert.equal(translate("es", "keywordResearch"), "Keyword Research");
  assert.equal(hasFullCoreTranslation("en"), true);
  assert.equal(hasFullCoreTranslation("fr"), false);
});

test("static UI text uses English fallback without locale-specific translations", () => {
  assert.equal(translateUiText("en", "Analyze store"), "Analyze store");
  assert.equal(translateUiText("es", "Analyze store"), "Analyze store");
  assert.equal(hasUiTextTranslation("en", "Analyze store"), true);
  assert.equal(hasUiTextTranslation("es", "Analyze store"), false);
});
