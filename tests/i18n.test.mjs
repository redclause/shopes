import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { LOCALES, getDirection, getLocale } from "../src/lib/i18n/languages.ts";
import { hasFullCoreTranslation, translate } from "../src/lib/i18n/messages.ts";
import { hasUiTextTranslation, translateUiText } from "../src/lib/i18n/ui-text.ts";

test("locale picker offers only the four selected UI locales", () => {
  assert.deepEqual(LOCALES.map((locale) => locale.code), ["en", "es", "fr", "de"]);
  assert.equal(new Set(LOCALES.map((locale) => locale.code)).size, 4);
  for (const code of ["eo", "af", "ka", "fa", "ps", "uz", "ar", "ja"]) {
    assert.equal(LOCALES.some((locale) => locale.code === code), false);
  }
});

test("unsupported saved locales fall back safely and selected locales use LTR", () => {
  assert.equal(getLocale("ka").code, "en");
  assert.equal(getLocale("not-a-locale").code, "en");
  assert.equal(getDirection("en"), "ltr");
  assert.equal(getDirection("es"), "ltr");
  assert.equal(getDirection("fr"), "ltr");
  assert.equal(getDirection("de"), "ltr");
});

test("core labels are translated for all offered locales", () => {
  for (const locale of LOCALES) assert.equal(hasFullCoreTranslation(locale.code), true);
  assert.equal(translate("es", "keywordResearch"), "Investigación de palabras clave");
  assert.equal(translate("fr", "generateIdeas"), "Générer des idées");
  assert.equal(translate("de", "keywordLanguage"), "Keyword-Sprache");
  assert.equal(translate("en", "home"), "Home");
  assert.equal(translate("eo", "home"), "Home");
  assert.equal(hasFullCoreTranslation("eo"), false);
});

test("locale persistence accepts only selectable locales and handles unavailable storage", async () => {
  const { readStoredLocale, persistLocale, applyLocaleToDocument } = await import("../src/lib/i18n/locale-state.ts");
  const values = new Map([["shopes-locale", "ar"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(readStoredLocale(storage), "en");
  assert.equal(persistLocale(storage, "fr"), true);
  assert.equal(readStoredLocale(storage), "fr");
  assert.equal(persistLocale(storage, "ka"), false);
  assert.equal(persistLocale(storage, "ar"), false);
  assert.equal(persistLocale(storage, "not-a-locale"), false);
  assert.equal(readStoredLocale({ getItem: () => { throw new Error("blocked"); } }), "en");
  assert.equal(persistLocale({ setItem: () => { throw new Error("blocked"); } }, "fr"), false);
  const fakeDocument = { documentElement: { lang: "", dir: "" } };
  applyLocaleToDocument(fakeDocument, "de");
  assert.deepEqual(fakeDocument.documentElement, { lang: "de", dir: "ltr" });
});

test("Keyword Research labels remain translated for the offered locales", () => {
  assert.equal(translate("fr", "generateIdeas"), "Générer des idées");
  assert.equal(translate("es", "seedKeyword"), "Palabra clave inicial o tema");
  assert.equal(translate("fr", "targetMarket"), "Marché cible");
  assert.equal(translate("de", "keywordLanguage"), "Keyword-Sprache");
  assert.equal(translate("es", "exportCsv"), "Exportar CSV");
});

test("static UI text translations work and missing copy remains explicitly detectable", () => {
  assert.equal(translateUiText("es", "Analyze store"), "Analizar tienda");
  assert.equal(translateUiText("fr", "Analyze store"), "Analyser la boutique");
  assert.equal(translateUiText("de", "Analyze store"), "Shop analysieren");
  assert.equal(hasUiTextTranslation("es", "Analyze store"), true);
  assert.equal(hasUiTextTranslation("fr", "A phrase not yet translated"), false);
  assert.equal(translateUiText("en", "A phrase not yet translated"), "A phrase not yet translated");
});

test("static JSX copy on primary routes has translations for every offered UI locale", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/login/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/dashboard/loading.tsx",
    "src/app/audit/AuditClient.tsx",
    "src/app/keyword-research/KeywordResearchClient.tsx",
  ];
  const visibleText = new Set();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (node.kind === ts.SyntaxKind.JsxText) {
        const text = node.getText(ast)
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, " ")
          .trim();
        if (
          text &&
          /[A-Za-zÀ-ž]/.test(text) &&
          !/^shopes$/i.test(text) &&
          !/^\d+(\.\d+)?k$/i.test(text) &&
          !/^[A-Z]{1,3}$/.test(text) &&
          !/^https?:\/\//i.test(text) &&
          !/^[a-z0-9-]+\.[a-z]{2,}$/i.test(text) &&
          !/^[\d.,/%$–—·\s]+$/.test(text)
        ) visibleText.add(text);
      }
      if (ts.isJsxAttribute(node) && ts.isStringLiteral(node.initializer) &&
          ["placeholder", "aria-label", "aria-description", "title", "alt"].includes(node.name.getText(ast))) {
        const text = node.initializer.text.trim();
        if (text && !/^https?:\/\//i.test(text) && /[A-Za-zÀ-ž]/.test(text)) visibleText.add(text);
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
  const missing = {};
  for (const locale of ["es", "fr", "de"]) {
    missing[locale] = [...visibleText].filter((text) => !hasUiTextTranslation(locale, text));
  }
  const summary = Object.entries(missing)
    .filter(([, phrases]) => phrases.length)
    .map(([locale, phrases]) => locale + ": " + phrases.join(" | "));
  assert.deepEqual(summary, [], "Add translations for every static JSX text node:\n" + summary.join("\n"));
});
