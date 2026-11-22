import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "ensure-cloudflare-production-routing.mjs");
const sample = (name = "shopes", options = "") => `import { defineConfig, defineWorker } from "cf/config";
export default defineConfig({
  worker: defineWorker({
    name: "${name}",
    ${options}
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-22",
    assets: { notFoundHandling: "none" },
    env: {},
  }),
});
`;
function run(source) {
  const dir = mkdtempSync(join(tmpdir(), "shopes-cf-config-"));
  try {
    if (source !== null) writeFileSync(join(dir, "cloudflare.config.ts"), source);
    const result = spawnSync(process.execPath, [script], { cwd: dir, encoding: "utf8" });
    const output = source === null ? null : readFileSync(join(dir, "cloudflare.config.ts"), "utf8");
    return { status: result.status, output, error: result.stderr };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test("generated Shopes config disables workers.dev and preview URLs", () => {
  const x = run(sample());
  assert.equal(x.status, 0, x.error);
  assert.match(x.output, /workersDev: false/);
  assert.match(x.output, /previewUrls: false/);
  assert.match(x.output, /name: "shopes"/);
});
test("existing true flags are forced false with no duplication", () => {
  const x = run(sample("shopes", "workersDev: true,\n    previewUrls: true,"));
  assert.equal(x.status, 0, x.error);
  assert.equal((x.output.match(/workersDev:/g) || []).length, 1);
  assert.equal((x.output.match(/previewUrls:/g) || []).length, 1);
  assert.match(x.output, /workersDev: false/);
  assert.match(x.output, /previewUrls: false/);
});
test("wrong worker name is rejected", () => {
  const x = run(sample("shopes-migration-preview"));
  assert.notEqual(x.status, 0);
});
test("missing config is rejected", () => {
  const x = run(null);
  assert.notEqual(x.status, 0);
});
