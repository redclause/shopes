# Shopes — Cloudflare Workers production migration

Status (2026-11-22): **Production hosting cut over to Cloudflare Workers Custom Domains**. Domain registrar remains at Vercel; this does not affect the website's hosting.

## Current infrastructure

- Production: `https://shopes.online` and `https://www.shopes.online` → Cloudflare Workers Custom Domains, service `shopes-migration-preview` (historical internal Worker name; this is now the production Worker).
- Cloudflare DNS zone: `7faba7ca8872451dddb26c3f192d9a1f`; Cloudflare manages proxied `AAAA 100::` placeholder DNS records for both Custom Domains. **Former Hetzner A records at 2.29.135.45 were deleted**.
- Google/Yandex verification TXT and existing CAA records were retained.
- Worker GitHub Builds source: `redclause/shopes`, branch `main`; squash merge PR #47 → `42c73e43f23526b0b01dea9de44f71d07acb7be0`.
- Cloudflare production build `6924582d-a380-4ac7-9fbc-f6e5b7a34d36` succeeded. Worker version `c08838f4-139c-40a6-937a-a7c138fd9acd`.
- `workers.dev` public endpoint is **disabled** so it does not expose an SEO-duplicate copy of production.
- Cloudflare Free plan; no additional paid provider, database, or Redis introduced by the migration.
- **Hetzner's old Docker app still needs to be stopped separately using host access**; public DNS no longer points there. Do not shut down the whole Hetzner VPS because other sites may share it.

## Google authentication

Auth.js v5 Google OAuth and One Tap are configured using Cloudflare Worker secrets:
- `AUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID_RUNTIME` (public client ID stored under a secret binding to survive forced CI deployments, though the ID itself is not confidential).

The public ID is served by `GET /api/google-client-config`, and all Google client secrets remain server-side. `GET /api/auth/csrf` and `GET /api/auth/providers` function normally. Google sign-in initiation returns an HTTPS 302 redirect to Google with PKCE and a correctly derived host-specific callback (`/api/auth/callback/google`). The user must complete a **real Google login in the browser**, then confirm the session, sign-out, and re-login. Static/CI tests alone do not prove the full Google callback has worked with a real account.

Ensure Google Cloud OAuth **Authorized JavaScript origins** and **Authorized redirect URIs** include apex and www hosts.

## Technical SEO Audit

`src/app/api/audit/route.ts` is restored (not stubbed). The endpoint requires authentication (HTTP 401 when signed out) and returns its prior full HTML audit findings for successful authenticated audits.

The Cloudflare transport in `src/lib/audit/cloudflare-transport.ts`:
- Accepts only standard HTTP/HTTPS 80/443 public domain URLs.
- Rejects IP literals, local/internal/special-use IP addresses, nonstandard ports and userinfo.
- Validates DNS answers for every hop of a redirect chain, rejects private results, caps redirects.
- Uses IP-pinned TLS/TCP with hostname/SNI verification for ordinary sites; Cloudflare-fronted DNS answers use runtime-gated Workers fetch because Cloudflare blocks outgoing TCP sockets to Cloudflare IP ranges.
- Limits HTML to 1 MB and network calls to 8 seconds.
- Does not enable public unauthenticated crawling.

**Important release distinction:** Node/GitHub CI validates SSRF checks and outbound request logic; the live Worker HTTP test validates unauthenticated rejection. A **real signed-in SEO Audit run against a public URL is still a manual end-to-end acceptance check**, not something those tests can replace.

## Verification

- Main CI, Vinext preflight and backlink audit: successful on PR #47.
- Edge preview transport and SSRF guard unit tests: 4/4 passed.
- Cloudflare Worker production-readiness GH Actions: `45054361457`, success.
- Live apex/www Custom Domain smoke GH Actions: `45054447148`, success including its post-workers.dev-disable rerun. Pages, sitemap, robots, HTTP indexing, Google OAuth initiation, PKCE, HTTPS callbacks and unauthenticated Audit endpoint passed on both domains.
- Public pages have no global `X-Robots-Tag: noindex`. The app may intentionally noindex certain login/auth pages.

## Operational notes

- Worker build-specific `CLOUDFLARE_WORKERS_BUILD=1` disables Next.js Hetzner standalone output.
- `CLOUDFLARE_PREVIEW_NOINDEX` is not set on production. Only set it to `1` for an isolated staging build.
- Automatic Cloudflare Builds deploy from `main`. The CLI uses `cf deploy --prebuilt --mode production --force` because this Worker originated with dashboard variables; verify that every runtime secret and Custom Domain remains configured after deployments.
- DNS registrar transfer from Vercel to Cloudflare Registrar is independent of hosting migration.
