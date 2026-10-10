#!/usr/bin/env node
/**
 * Incremental, low-impact catalog audit. Discovery is not proof of submission
 * permission or an accepted backlink opportunity. This tool never submits forms.
 *
 * Usage:
 *   npm run backlink:audit -- --limit 10
 *   npm run backlink:audit -- --limit 25 --delay-ms 1500 --state .backlink-audit.json
 */
import { readFile, writeFile } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { backlinkSiteCatalog } from "../src/app/backlink-maker/site-catalog.ts";
import { extractPageEvidence, classifySubmissionPage } from "../src/app/backlink-maker/submission-analysis.mjs";

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--")
    ? args[index + 1]
    : fallback;
}
const limit = Math.max(1, Math.min(100, Number(option("--limit", "10")) || 10));
const delayMs = Math.max(1000, Math.min(15000, Number(option("--delay-ms", "1200")) || 1200));
const statePath = option("--state", ".backlink-audit.json");
const timeoutMs = 6000;
const maxBytes = 250_000;

function isPrivateAddress(address) {
  const normalized = address.toLowerCase();
  if (normalized.includes(":")) {
    if (normalized === "::" || normalized === "::1" || normalized.startsWith("fc") ||
        normalized.startsWith("fd") || /^fe[89ab]/.test(normalized) ||
        normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") ||
        normalized.startsWith("::ffff:192.168.") || normalized.startsWith("::ffff:169.254.")) return true;
    return false;
  }
  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a >= 224) || (a === 100 && b >= 64 && b <= 127);
}

async function assertPublicHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("private_or_local_host");
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error("private_or_reserved_ip");
    return;
  }
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("non_public_dns_result");
  }
}

async function fetchPublicPage(input) {
  let url = new URL(input);
  for (let hop = 0; hop <= 3; hop++) {
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("unsafe_url");
    await assertPublicHost(url.hostname);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "ShopesCatalogAudit/1.0 (+https://shopes.online)", accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.2" },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel().catch(() => undefined);
        if (!location) return { status: response.status, finalUrl: url.href, html: "", redirect: "missing_location" };
        if (hop === 3) return { status: response.status, finalUrl: url.href, html: "", redirect: "too_many_redirects" };
        url = new URL(location, url);
        continue;
      }
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) return { status: response.status, finalUrl: url.href, html: "", contentType };
      if (contentType && !/(text\/html|application\/xhtml\+xml)/i.test(contentType)) {
        await response.body?.cancel().catch(() => undefined);
        return { status: response.status, finalUrl: url.href, html: "", contentType, note: "non_html_response" };
      }
      const reader = response.body?.getReader();
      if (!reader) return { status: response.status, finalUrl: url.href, html: "", contentType };
      const chunks = [];
      let bytes = 0;
      try {
        while (bytes < maxBytes) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = value.subarray(0, Math.min(value.length, maxBytes - bytes));
          chunks.push(chunk);
          bytes += chunk.length;
          if (bytes >= maxBytes) break;
        }
      } finally {
        await reader.cancel().catch(() => undefined);
      }
      return { status: response.status, finalUrl: url.href, html: Buffer.concat(chunks).toString("utf8"), contentType, truncated: bytes >= maxBytes };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("redirect_limit");
}

function candidateLinks(html, baseUrl) {
  const out = [];
  const pattern = /<a\b([^>]*?)\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))([^>]*)>([\s\S]*?)<\/a\s*>/gi;
  const keywords = /submit|submission|contribut|add[-_/ ]?(listing|business|product|site|resource)|suggest|write[-_/ ]?for[-_/ ]?us|guest[-_/ ]?post|get[-_/ ]?listed|claim[-_/ ]?(profile|business)|create[-_/ ]?profile|register|directory/i;
  for (const match of html.matchAll(pattern)) {
    const raw = (match[2] ?? match[3] ?? match[4] ?? "").replace(/&amp;/gi, "&");
    const label = match[6].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    try {
      const candidate = new URL(raw, baseUrl);
      if (!["http:", "https:"].includes(candidate.protocol) || candidate.username || candidate.password) continue;\n      if (candidate.origin !== new URL(baseUrl).origin) continue;
      if (!keywords.test(candidate.pathname + " " + label)) continue;
      if (!out.some((item) => item.url === candidate.href)) out.push({ url: candidate.href, label: label || candidate.pathname });
      if (out.length >= 20) break;
    } catch { /* Ignore malformed external markup. */ }
  }
  return out;
}

let previous = { version: 1, records: {} };
try {
  const parsed = JSON.parse(await readFile(statePath, "utf8"));
  if (parsed && parsed.version === 1 && parsed.records && typeof parsed.records === "object") previous = parsed;
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const catalog = backlinkSiteCatalog;
const pending = catalog.filter((site) => !previous.records[site.id] || args.includes("--recheck")).slice(0, limit);
console.log(`Catalog entries: ${catalog.length}; queued this run: ${pending.length}; state file: ${statePath}`);

for (const [index, site] of pending.entries()) {
  const checkedAt = new Date().toISOString();
  try {
    const page = await fetchPublicPage(site.url);
    const candidates = page.html ? candidateLinks(page.html, page.finalUrl) : [];
    const pageEvidence = [];
    if (page.html) {
      const homepageEvidence = extractPageEvidence(page.html, page.finalUrl);
      pageEvidence.push({ ...homepageEvidence, ...classifySubmissionPage(homepageEvidence) });
    }
    // Inspect a small number of same-origin candidate pages; do not submit forms.
    for (const candidate of candidates.slice(0, 3)) {
      try {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        const candidatePage = await fetchPublicPage(candidate.url);
        if (candidatePage.html) {
          const evidence = extractPageEvidence(candidatePage.html, candidatePage.finalUrl);
          pageEvidence.push({
            ...evidence,
            ...classifySubmissionPage(evidence),
            httpStatus: candidatePage.status,
            discoveredFrom: page.finalUrl,
            discoveryAnchorText: candidate.label,
          });
        } else {
          pageEvidence.push({
            pageUrl: candidate.url,
            title: null,
            httpStatus: candidatePage.status,
            classification: "candidate_discovered",
            automationEligible: false,
            reason: "candidate_page_has_no_inspectable_html",
          });
        }
      } catch (error) {
        pageEvidence.push({
          pageUrl: candidate.url,
          classification: "inconclusive",
          automationEligible: false,
          reason: error?.name === "AbortError" ? "timeout" : "candidate_fetch_failed",
        });
      }
    }
    previous.records[site.id] = {
      siteId: site.id, name: site.name, domain: site.domain, homepage: site.url,
      checkedAt, checkResult: page.status >= 200 && page.status < 300 ? "homepage_reachable" : "homepage_unavailable",
      httpStatus: page.status, finalUrl: page.finalUrl, contentType: page.contentType || null,
      truncated: Boolean(page.truncated), submissionCandidates: candidates, pageEvidence,
      submissionEndpointVerified: pageEvidence.some((item) => item.classification === "endpoint_evidence_found"),
      automationVerified: false,
      classification: pageEvidence.some((item) => item.classification === "endpoint_evidence_found") ? "endpoint_evidence_found" : "candidate_discovered",
      note: "Endpoint evidence is based on an actual same-origin form plus page intent. This is not proof of permission to automate, successful publication, or a verified backlink. No forms were submitted.",
    };
    console.log(`[${index + 1}/${pending.length}] ${site.id}: HTTP ${page.status}; candidates=${candidates.length}; form-evidence=${pageEvidence.filter((item) => item.classification === "endpoint_evidence_found").length}; automation remains unverified`);
  } catch (error) {
    previous.records[site.id] = {
      siteId: site.id, name: site.name, domain: site.domain, homepage: site.url,
      checkedAt, checkResult: "audit_error", classification: "unverified",
      error: error?.name === "AbortError" ? "timeout" : String(error?.message || "request_failed").slice(0, 160),
      submissionEndpointVerified: false, automationVerified: false,
    };
    console.log(`[${index + 1}/${pending.length}] ${site.id}: audit error; remains unverified`);
  }
  await writeFile(statePath, JSON.stringify({ ...previous, updatedAt: new Date().toISOString() }, null, 2) + "\n", "utf8");
  if (index < pending.length - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
}
console.log(`Saved ${Object.keys(previous.records).length} audit records. This tool discovers candidates only; it never submits content or upgrades a site to automated support.`);
