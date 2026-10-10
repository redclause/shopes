/**
 * Conservative, dependency-free HTML evidence extraction for backlink workflows.
 * This module never submits forms. It records evidence so policy/eligibility
 * decisions are not based on URL keywords alone.
 */
const decode = (value = "") => value
  .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&nbsp;/gi, " ");

export function visibleText(html = "") {
  return decode(html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")).trim().slice(0, 50000);
}

function attr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp("(?:^|\\s)" + escaped + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i").exec(tag);
  return match ? decode(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

export function extractPageEvidence(html, pageUrl) {
  const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html)?.[1] ?? "";
  const text = visibleText(html);
  const forms = [];
  for (const match of html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form\s*>/gi)) {
    const opening = match[0].slice(0, match[0].indexOf(">") + 1);
    const rawAction = attr(opening, "action") || pageUrl;
    let actionUrl = null;
    try {
      const parsed = new URL(rawAction, pageUrl);
      if (["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password) actionUrl = parsed.href;
    } catch { /* malformed form action */ }
    const fields = [];
    const body = match[1];
    for (const field of body.matchAll(/<(input|textarea|select|button)\b[^>]*>/gi)) {
      const tag = field[0];
      const type = (attr(tag, "type") || (field[1].toLowerCase() === "textarea" ? "textarea" : field[1].toLowerCase() === "select" ? "select" : field[1].toLowerCase())).toLowerCase();
      const name = attr(tag, "name");
      const id = attr(tag, "id");
      const placeholder = attr(tag, "placeholder");
      const ariaLabel = attr(tag, "aria-label");
      if (["submit", "button", "reset", "hidden", "image"].includes(type) && !name && !id) continue;
      fields.push({ tag: field[1].toLowerCase(), type, name, id, placeholder, ariaLabel, required: /\brequired(?:\s|=|\/?>)/i.test(tag) });
    }
    const method = (attr(opening, "method") || "get").toLowerCase();
    forms.push({
      pageUrl,
      actionUrl,
      method: ["get", "post", "dialog"].includes(method) ? method : "unknown",
      fields: fields.slice(0, 60),
      fieldCount: fields.length,
      hasExternalAction: Boolean(actionUrl && new URL(actionUrl).origin !== new URL(pageUrl).origin),
      hasPasswordField: fields.some((field) => field.type === "password"),
      hasCaptchaSignal: /captcha|recaptcha|hcaptcha|turnstile/i.test(match[0]),
      hasConsentSignal: /consent|terms|privacy|agree/i.test(match[0]),
      excerpt: visibleText(match[0]).slice(0, 500),
    });
  }
  const intentPatterns = [
    ["guest_post", /guest post|write for us|submit an article|contribute an article|editorial submission/i],
    ["directory_listing", /add (your )?(site|business|product|listing)|submit (a )?(site|business|product|listing)|get listed/i],
    ["comment", /leave a comment|post comment|your comment|reply to this/i],
    ["profile", /create (an? )?account|create (your )?profile|public profile/i],
    ["community_post", /create a post|publish a post|new discussion|start a discussion/i],
  ];
  const intentEvidence = intentPatterns.filter(([, pattern]) => pattern.test(text)).map(([kind]) => kind);
  const canonicalRaw = /<link\b[^>]*\brel\s*=\s*(?:"canonical"|'canonical'|canonical)[^>]*>/i.exec(html)?.[0];
  let canonicalUrl = null;
  if (canonicalRaw) {
    const href = attr(canonicalRaw, "href");
    try { canonicalUrl = href ? new URL(href, pageUrl).href : null; } catch { /* malformed canonical */ }
  }
  const protectionSignals = [];
  if (/captcha|recaptcha|hcaptcha|turnstile/i.test(html)) protectionSignals.push("captcha_or_challenge");
  if (/sign in to continue|log in to continue|you must be logged in|login required/i.test(text)) protectionSignals.push("login_required");
  if (/temporarily blocked|access denied|automated requests|unusual traffic/i.test(text)) protectionSignals.push("anti_bot_or_access_block");
  return {
    pageUrl,
    title: visibleText(title).slice(0, 240),
    canonicalUrl,
    intentEvidence,
    forms,
    protectionSignals,
    textExcerpt: text.slice(0, 1200),
  };
}

export function classifySubmissionPage(evidence, { robotsDisallow = false } = {}) {
  if (!evidence || evidence.protectionSignals?.length) {
    return { classification: "manual_review_required", automationEligible: false, reason: "access_or_protection_signal" };
  }
  if (robotsDisallow) {
    return { classification: "manual_review_required", automationEligible: false, reason: "crawler_disallowed_by_robots" };
  }
  const intent = evidence.intentEvidence ?? [];
  const relevantForm = (evidence.forms ?? []).find((form) =>
    form.actionUrl && form.fieldCount > 0 &&
    form.fields.some((field) => /url|website|link|comment|message|content|article|description|name|email/i.test([field.name, field.id, field.placeholder, field.ariaLabel].filter(Boolean).join(" "))) &&
    !form.hasCaptchaSignal && !form.hasPasswordField
  );
  if (!relevantForm || !intent.length) {
    return { classification: "candidate_discovered", automationEligible: false, reason: "insufficient_form_and_intent_evidence" };
  }
  // Public HTML cannot reliably prove permission to automate or publish. This
  // status is intentionally not an automatic permission grant.
  return {
    classification: "endpoint_evidence_found",
    automationEligible: false,
    reason: "form_and_submission_intent_found_but_site_permission_requires_review",
    form: relevantForm,
    intentEvidence: intent,
  };
}
