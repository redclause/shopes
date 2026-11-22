import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * vinext init creates cloudflare.config.ts during Cloudflare Builds.
 * Keep the production Worker on its canonical identity and ensure that the
 * temporary workers.dev endpoints do not become duplicate indexable sites.
 *
 * Runs after vinext init and before vite build / cf deploy. This script only
 * edits the build-time generated file; no Worker or secrets are modified.
 */
const file = "cloudflare.config.ts";
assert.ok(fs.existsSync(file), "vinext must generate cloudflare.config.ts first");
let source = fs.readFileSync(file, "utf8");
assert.match(source, /worker:\s*defineWorker\s*\(\s*\{/);
const shopesName = /\bname:\s*["']shopes["']\s*,/;
assert.match(source, shopesName, "Refusing to configure an unexpected Worker name");

// Fail closed rather than quietly leaving public duplicate endpoints enabled.
if (/\bworkersDev\s*:/.test(source)) {
  source = source.replace(/\bworkersDev\s*:\s*(?:true|false)/, "workersDev: false");
} else {
  source = source.replace(shopesName, "$&\n    workersDev: false,");
}
if (/\bpreviewUrls\s*:/.test(source)) {
  source = source.replace(/\bpreviewUrls\s*:\s*(?:true|false)/, "previewUrls: false");
} else {
  source = source.replace(shopesName, "$&\n    previewUrls: false,");
}
assert.match(source, /workersDev:\s*false/);
assert.match(source, /previewUrls:\s*false/);
assert.equal((source.match(/\bworkersDev\s*:/g) || []).length, 1);
assert.equal((source.match(/\bpreviewUrls\s*:/g) || []).length, 1);
fs.writeFileSync(file, source, "utf8");
console.log("Shopes production worker name and private workers.dev routing verified.");
