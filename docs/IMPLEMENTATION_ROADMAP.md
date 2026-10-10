# Shopes Product Completion Roadmap

**Repository:** redclause/shopes  
**Production domain:** shopes.online  
**Architecture:** Next.js App Router, React, TypeScript, Auth.js v5, Vercel, GitHub Actions.

This roadmap combines two product pillars in one application: (1) an online-store search experience powered by Google Programmable Search Engine (PSE), and (2) an SEO SaaS workspace for authenticated store owners. It is based on the repository state audited on 2026-10-10. It is an implementation sequence, not a claim that listed capabilities already exist.

## Verified baseline

- The repository currently contains the Next.js marketing homepage, Google OAuth/Auth.js route, login page, middleware, and an authenticated dashboard foundation.
- Dashboard code uses the existing Auth.js session and shows honest empty states; persistent website projects and live audit data are not implemented in the checked-in source.
- The README explicitly says project persistence, live crawling/audits, keyword data, billing, and live third-party integrations are not implemented.
- No Google PSE search page, PSE loader, or search-engine ID variable is present in the checked-in source. The /search route in this feature branch adds a real integration surface but does not invent a search ID or results.
- The repository's dependency manifest contains Next.js 15, React 19, Auth.js v5 beta, TypeScript, and Lucide; no database client or testing/browser automation framework is configured.
- main at audit time is commit 9b48fbcd8da6578efa8001147522dbe831acb059. CI passed typecheck, lint, and production build for that commit.
- Existing pricing, dashboard charts, and homepage audit snippets are illustrative, not live customer data or enabled billing.

## Product architecture: two connected pillars

1. **Public store search:** / remains the marketing landing page; /search is the dedicated online-store search experience powered by the existing/approved Google PSE configuration.
2. **SEO workspace:** /dashboard, /settings, and future project/audit routes are authenticated. Each persisted project and audit must be owned by the authenticated user.
3. **Shared identity, separate responsibilities:** Google OAuth authenticates a user; it does not grant Search Console access. Search Console or other integrations require their own authorized consent and token handling.
4. **Single approved infrastructure:** retain Next.js, Auth.js, Vercel, and the existing deployment pipeline. Do not add a database, Redis, paid SEO API, billing, or background-worker infrastructure without explicit approval.

## Implementation order

### Phase 0 — Repository health and safe delivery
- Reconcile existing open PRs against current main; do not merge stale dashboard/redesign PRs without reviewing their diffs.
- Ensure each feature branch has typecheck, lint, build, and Preview checks; resolve regressions before requesting merge.
- Review dependency audit findings package-by-package; avoid blind npm audit fix --force.
- Add or document branch protection only through an authorized repository settings change.

**Exit criteria:** clean baseline checks, no conflicting PR work, known security/dependency issues triaged.

### Phase 1 — Authentication and route security
- Preserve the current Google provider, callback route, JWT session strategy, and environment variable names.
- Test sign-in/sign-out on deployed Preview, callback URL behavior, protected route redirects, and session error handling.
- Review server actions and middleware; add server-side authorization to each private operation as those operations are implemented.
- Keep profile fields sourced from Google read-only unless a separate Shopes profile model is deliberately added.

**Exit criteria:** verified live OAuth and consistent unauthenticated behavior without secrets in client bundles/logs.

### Phase 2 — Public online-store search
- Configure the public PSE engine ID via NEXT_PUBLIC_GOOGLE_CSE_ID; the ID is a public engine identifier, not a secret key.
- Verify the PSE is configured for online-store/shopping domains, then test real results, links, empty queries, pagination, and mobile layout.
- Add clear fallback/error states when the ID is missing or the provider fails; never fabricate results.
- Preserve existing homepage and blog routes; make search discoverable from public navigation.

**Exit criteria:** live PSE results verified on Preview and Production, or a clearly documented provider-configuration blocker.

### Phase 3 — Account and onboarding
- Review the account-settings PR; keep Google identity read-only.
- Link Dashboard, settings, and public search navigation with meaningful destinations.
- Explain which capabilities are available now and which are not connected.

**Exit criteria:** working navigation and truthful account/onboarding states.

### Phase 4 — Persistence decision and project CRUD
- First confirm an existing database is available and approved. The checked-in repo has no database client/schema and README says persistence is deferred.
- If no approved database exists, request explicit approval before selecting a provider or introducing schema/infrastructure. Do not infer production credentials or run destructive migrations.
- After approval, design the smallest compatible schema for users, projects, audit runs, and findings; enforce owner-scoped reads/writes in server-side queries.
- Implement validated URL normalization, duplicate handling, create/list/detail/edit/delete, pagination, and migrations.

**Exit criteria:** CRUD integration tests prove persistence and prevent cross-user access.

### Phase 5 — Safe technical SEO audit MVP
- Start with a bounded single-page audit of a user-supplied URL, not an unrestricted crawler.
- Validate protocols, block localhost/private/link-local/reserved IPs, resolve and revalidate DNS, revalidate every redirect, restrict ports, set timeouts and response-size/content-type limits, and defend against SSRF/rebinding.
- Respect robots.txt and rate limits, use a transparent user agent, and never bypass CAPTCHA or anti-bot controls.
- Report observable title, meta description, canonical, robots directives, headings, status code, and basic link checks. Distinguish failed checks from unavailable/inconclusive checks.
- Save audit history only after approved persistence is available.

**Exit criteria:** fixture-based tests, SSRF/redirect guard tests, bounded runtime/resource use, and truthful findings.

### Phase 6 — Search/SEO insights and integrations
- Add keyword data only if an existing source is available or a new provider is explicitly approved.
- Add Search Console only via its own OAuth consent/scopes and securely stored refresh tokens; Google sign-in alone is insufficient.
- Add product feed validation from user-provided files/URLs with bounded parsing and clear errors.
- Keep competitor analysis and search-volume figures unavailable until backed by a real source.

**Exit criteria:** every metric and integration is traceable to a real source and authorized account.

### Phase 7 — UI, accessibility, metadata, and performance
- Keep the soft, muted, rounded Shopes visual language; improve consistency rather than rewriting all pages.
- Verify mobile navigation, keyboard behavior, contrast, reduced motion, loading/error/empty states, metadata, canonicals, sitemap, and structured data.
- Remove misleading links/controls or connect them to implemented routes.

**Exit criteria:** accessibility checks and responsive smoke tests pass; no fake operational claims.

### Phase 8 — Release verification
- Run install, typecheck, lint, build, relevant unit/integration/browser tests, dependency audit, and Preview smoke tests.
- Verify production deployment only after the owner explicitly authorizes each merge.
- Report exact commit, PR state, checks, deployment URL/status, tested routes, known limitations, and any remaining external configuration.

**Exit criteria:** all implemented features are verified on the deployment; unimplemented items are clearly marked.

## Current external/configuration blockers

- **Google PSE ID:** not found in tracked source or .env.example. The search route must remain in a clear unconfigured state until the correct engine ID is supplied through Vercel environment configuration. Do not change production environment variables without authorization.
- **Database:** no database client/schema is present in the current tree; persistence needs an explicit infrastructure decision/approval unless an already-configured, accessible database is confirmed.
- **Live SEO/keyword data:** no provider integration is present; do not display real metrics until an approved source is connected.
- **Live OAuth:** CI/build success does not prove the Google callback works in a deployed browser; test it on Preview.

## Delivery rules

- Feature branches and focused PRs only; never commit directly to main.
- No PR is merged without explicit user authorization.
- No production secrets or environment values are changed.
- No destructive migrations, billing, new paid APIs, or new infrastructure without approval.
- Never claim a test or deployment passed without a recorded result.
