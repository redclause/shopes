# Shopes Product Completion Roadmap

**Repository:** redclause/shopes  
**Production domain:** shopes.online  
**Architecture:** Next.js App Router, React, TypeScript, Auth.js v5, Vercel, GitHub Actions.

This roadmap combines two product pillars in one application: (1) an online-store search experience powered by Google Programmable Search Engine (PSE), and (2) an SEO SaaS workspace for authenticated store owners. It is an implementation sequence, not a claim that every listed capability already exists.

## Verified baseline

- The repository contains the Next.js marketing homepage, Google OAuth/Auth.js route, login page, middleware, and authenticated dashboard foundation.
- Dashboard code uses the existing Auth.js session and shows honest empty states; persistent website projects and live audit data are not implemented in the checked-in source.
- The README states that project persistence, live crawling/audits, keyword data, billing, and live third-party integrations are not implemented.
- The search feature branch includes a dedicated `/search` route powered by Google Programmable Search Engine. The user has supplied the public engine ID `e2dc391aa286b4b8d`; the route uses it as a default and permits `NEXT_PUBLIC_GOOGLE_CSE_ID` to override it.
- The repository has no database client/schema or configured test/browser automation framework in its checked-in source.
- The repository's dependency manifest uses Next.js 15, React 19, Auth.js v5 beta, TypeScript, and Lucide; dependency advisories should be reviewed package-by-package.
- Existing pricing, dashboard charts, and homepage audit snippets are illustrative, not live customer data or enabled billing.

## Product architecture: two connected pillars

1. **Public store search:** `/` is the marketing landing page; `/search` provides the online-store search experience through Google PSE.
2. **SEO workspace:** `/dashboard`, `/settings`, and future project/audit routes are authenticated. Each persisted project and audit must be owned by the authenticated user.
3. **Shared identity, separate responsibilities:** Google OAuth authenticates a user; it does not grant Search Console access. Search Console or other integrations require separate authorization and token handling.
4. **Single approved infrastructure:** retain Next.js, Auth.js, Vercel, and the existing deployment pipeline. Do not add a database, Redis, paid SEO API, billing, or background-worker infrastructure without explicit approval.

## Implementation order

### Phase 0 — Repository health and safe delivery
- Reconcile existing open PRs against current main; review stale dashboard/redesign PRs before any merge.
- Ensure each feature branch has typecheck, lint, build, and Preview checks; resolve regressions before requesting merge.
- Review dependency advisories package-by-package; avoid blind `npm audit fix --force`.

**Exit criteria:** clean baseline checks, no conflicting PR work, known dependency/security issues triaged.

### Phase 1 — Authentication and route security
- Preserve the current Google provider, callback route, JWT session strategy, and environment-variable names.
- Test sign-in/sign-out on deployed Preview, callback URL behavior, protected route redirects, and session error handling.
- Add server-side authorization to each private operation as those operations are implemented.

**Exit criteria:** verified live OAuth and consistent unauthenticated behavior without secrets in client bundles/logs.

### Phase 2 — Public online-store search
- The public PSE ID `e2dc391aa286b4b8d` is now the default in the search route; `NEXT_PUBLIC_GOOGLE_CSE_ID` can override it per deployment.
- Verify that the PSE engine is configured for the intended online-store domains, then test real results, links, empty queries, pagination, and mobile layout.
- Keep provider error states clear and never fabricate results.
- Preserve existing homepage and blog routes; make search discoverable from public navigation.

**Exit criteria:** live PSE results verified on Preview and Production, or a clearly documented provider-side configuration issue.

### Phase 3 — Account and onboarding
- Review the account-settings PR; keep Google identity read-only.
- Link Dashboard, settings, and public search navigation with meaningful destinations.
- Explain which capabilities are available now and which are not connected.

**Exit criteria:** working navigation and truthful account/onboarding states.

### Phase 4 — Persistence decision and project CRUD
- No database client/schema is present in the checked-in tree, and the README says persistence is deferred.
- The owner has said they do not know which database to choose. Recommend the simplest compatible option and explain costs/limits; do not create a provider, change production environment variables, or add infrastructure until the owner explicitly approves the choice.
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
- Report exact commit, PR state, checks, deployment URL/status, tested routes, known limitations, and remaining external configuration.

**Exit criteria:** all implemented features are verified on the deployment; unimplemented items are clearly marked.

## Current external/configuration blockers

- **Google PSE:** the supplied ID is wired into the search route. Actual search still needs Preview/browser verification and confirmation that the Google engine is configured to return the intended store-search coverage.
- **Database:** no database client/schema is present. Recommend a low-cost compatible option, but wait for explicit approval before provisioning or adding infrastructure.
- **Live SEO/keyword data:** no provider integration is present; do not display real metrics until an approved source is connected.
- **Live OAuth:** CI/build success does not prove the Google callback works in a deployed browser; test it on Preview.

## Delivery rules

- Feature branches and focused PRs only; never commit directly to main.
- No PR is merged without explicit user authorization.
- No production secrets or environment values are changed.
- No destructive migrations, billing, new paid APIs, or new infrastructure without approval.
- Never claim a test or deployment passed without a recorded result.
