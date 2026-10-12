import test from "node:test";
import assert from "node:assert/strict";

const intents = new Set(["Informational", "Commercial", "Transactional", "Navigational", "Local", "Unclassified"]);
function validate(raw, input) {
  const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed.groups) || !Array.isArray(parsed.recommendations)) return null;
    const allowed = new Set(input);
    const groups = parsed.groups.flatMap((g) => {
      if (!g || typeof g.label !== "string" || g.label.length > 60 || !intents.has(g.intent) || !Array.isArray(g.keywords)) return [];
      const keywords = g.keywords.filter((k) => typeof k === "string" && allowed.has(k));
      return keywords.length ? [{ label: g.label, intent: g.intent, keywords }] : [];
    });
    if (!groups.length) return null;
    return { groups, recommendations: parsed.recommendations.filter((x) => typeof x === "string").slice(0, 4) };
  } catch { return null; }
}
test("accepts only valid intent labels and exact input phrases", () => {
  const input = ["best coffee mug", "buy blue mug"];
  const result = validate(JSON.stringify({groups:[{label:"Compare",intent:"Commercial",keywords:["best coffee mug","invented phrase"]}],recommendations:["Review the product page"]}), input);
  assert.deepEqual(result?.groups[0].keywords, ["best coffee mug"]);
});
test("rejects invalid JSON, schema, and unsupported intent", () => {
  assert.equal(validate("not json", ["a"]), null);
  assert.equal(validate(JSON.stringify({groups:[{label:"x",intent:"Made up",keywords:["a"]}],recommendations:[]}), ["a"]), null);
});
test("rejects model output containing no supplied phrases", () => {
  assert.equal(validate(JSON.stringify({groups:[{label:"x",intent:"Commercial",keywords:["not supplied"]}],recommendations:[]}), ["a"]), null);
});
