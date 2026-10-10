import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyIntent,
  csvEscape,
  exportKeywordCsv,
  generateKeywordIdeas,
  normalizeKeyword,
  parseImportedSerpData,
  summarizeDomainOverlap,
} from "../src/app/keyword-research/engine.ts";

test("normalization collapses whitespace and case", () => {
  assert.equal(normalizeKeyword("  Organic   DOG Food "), "organic dog food");
});

test("generates deterministic English keyword ideas with no duplicates", () => {
  const first = generateKeywordIdeas("organic dog food", "English");
  const second = generateKeywordIdeas("organic dog food", "English");
  assert.deepEqual(first, second);
  assert.ok(first.length > 15);
  assert.equal(new Set(first.map((idea) => idea.normalized)).size, first.length);
  assert.ok(first.some((idea) => idea.phrase === "best organic dog food"));
});

test("Georgian rules remain internal but are not offered as an AdSense-supported research language", async () => {
  const { SUPPORTED_KEYWORD_LANGUAGES } = await import("../src/app/keyword-research/engine.ts");
  assert.equal(SUPPORTED_KEYWORD_LANGUAGES.includes("Georgian"), false);
});

test("generates Georgian keyword ideas with internal rules", () => {
  const ideas = generateKeywordIdeas("ონლაინ მაღაზია", "Georgian");
  assert.ok(ideas.some((idea) => idea.phrase === "საუკეთესო ონლაინ მაღაზია"));
  assert.ok(ideas.some((idea) => idea.phrase.startsWith("როგორ ")));
});

test("classifies intent with transparent local heuristics", () => {
  assert.equal(classifyIntent("buy running shoes", "English"), "Transactional");
  assert.equal(classifyIntent("best running shoes", "English"), "Commercial");
  assert.equal(classifyIntent("how to train a puppy", "English"), "Informational");
  assert.equal(classifyIntent("ფასი ონლაინ მაღაზია", "Georgian"), "Transactional");
});

test("scores are bounded and never masquerade as verified metrics", () => {
  const ideas = generateKeywordIdeas("coffee grinder", "English");
  for (const idea of ideas) {
    assert.ok(idea.opportunityScore >= 0 && idea.opportunityScore <= 100);
    assert.ok(idea.relevanceScore >= 0 && idea.relevanceScore <= 100);
    assert.equal(idea.metricsStatus, "unavailable");
    assert.ok(idea.estimatedCpcLowUsd >= 0);
    assert.ok(idea.estimatedCpcHighUsd > idea.estimatedCpcLowUsd);
    assert.equal(idea.cpcConfidence, "low");
    assert.equal(idea.provenance, "locally-generated");
  }
});

test("CSV escaping quotes values and neutralizes spreadsheet formulas", () => {
  assert.equal(csvEscape('a,"b"'), '"a,""b"""');
  assert.equal(csvEscape("=1+1"), '"\'=1+1"');
  const csv = exportKeywordCsv(generateKeywordIdeas("shop", "English"), "US", "English");
  assert.match(csv, /Shopes Opportunity Score/);
  assert.match(csv, /Modelled CPC low \(USD\)/);
  assert.match(csv, /Low — uncalibrated heuristic/);
  assert.match(csv, /Unavailable/);
});

test("imports valid CSV and summarizes domain overlap", () => {
  const data = [
    "keyword,url,title,description,rank",
    '"coffee grinder",https://example.com/a,Guide,Description,2',
    '"coffee grinder",https://www.example.com/b,More,Description,4',
    '"best grinder",https://other.example/item,Review,Description,1',
  ].join("\n");
  const records = parseImportedSerpData(data, "csv", "fixture.csv");
  assert.equal(records.length, 3);
  assert.equal(records[0].domain, "example.com");
  const summary = summarizeDomainOverlap(records);
  assert.equal(summary[0].domain, "example.com");
  assert.equal(summary[0].occurrences, 2);
  assert.equal(summary[0].keywords.length, 1);
  assert.equal(summary[0].averageRank, 3);
});

test("imports JSON and rejects malformed or oversized inputs", () => {
  const records = parseImportedSerpData(JSON.stringify([{ keyword: "term", url: "https://example.com", title: "Title" }]), "json");
  assert.equal(records.length, 1);
  assert.throws(() => parseImportedSerpData("{broken", "json"), /valid JSON/);
  assert.throws(() => parseImportedSerpData("x".repeat(2_000_001), "csv"), /2 MB/);
  assert.throws(() => generateKeywordIdeas("x".repeat(121), "English"), /120 characters/);
});

test("supports local generation and intent rules for all declared research languages", async () => {
  const { KEYWORD_LANGUAGE_RULES, SUPPORTED_KEYWORD_LANGUAGES } = await import("../src/app/keyword-research/engine.ts");
  assert.equal(SUPPORTED_KEYWORD_LANGUAGES.length, 19);
  assert.equal(SUPPORTED_KEYWORD_LANGUAGES.includes("Georgian"), false);
  for (const language of SUPPORTED_KEYWORD_LANGUAGES) {
    const rules = KEYWORD_LANGUAGE_RULES[language];
    assert.ok(rules.modifiers.length >= 8, language + " should have commercial and transactional modifiers");
    assert.ok(rules.questions.length >= 5, language + " should have question patterns");
    assert.ok(rules.suffixes.length >= 5, language + " should have topic suffixes");
    const ideas = generateKeywordIdeas("shop", language);
    assert.ok(ideas.length > 10, language + " should generate local keyword ideas");
    assert.equal(new Set(ideas.map((idea) => idea.normalized)).size, ideas.length);
    assert.ok(ideas.every((idea) => idea.provenance === "locally-generated" && idea.metricsStatus === "unavailable"));
  }
});

test("classifies transactional and commercial modifiers in non-English supported languages", async () => {
  assert.equal(classifyIntent("comprar zapatos", "Spanish"), "Transactional");
  assert.equal(classifyIntent("mejor teléfono", "Spanish"), "Commercial");
  assert.equal(classifyIntent("купить телефон", "Russian"), "Transactional");
  assert.equal(classifyIntent("أفضل هاتف", "Arabic"), "Commercial");
  assert.equal(classifyIntent("가격 구매", "Korean"), "Transactional");
});
