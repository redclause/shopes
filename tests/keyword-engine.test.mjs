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

test("generates Georgian keyword ideas", () => {
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
    assert.equal(idea.provenance, "locally-generated");
  }
});

test("CSV escaping quotes values and neutralizes spreadsheet formulas", () => {
  assert.equal(csvEscape('a,"b"'), '"a,""b"""');
  assert.equal(csvEscape("=1+1"), '"\'=1+1"');
  const csv = exportKeywordCsv(generateKeywordIdeas("shop", "English"), "US", "English");
  assert.match(csv, /Shopes Opportunity Score/);
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
