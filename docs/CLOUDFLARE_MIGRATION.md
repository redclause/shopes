# Cloudflare Workers migration — Shopes

Status: **compatibility preflight only**. Do not change production DNS or the current Hetzner app.

## Inventory

- Source: `redclause/shopes`, Next.js 15 App Router, Auth.js v5 with Google OAuth.
- Existing hosting: Hetzner standalone Next.js app, domain `shopes.online`.
- Cloudflare DNS zone exists; A/WWW currently point to existing origin (inspected 2026-11-22).
- No Shopes Cloudflare Worker has been deployed.

## Identified blockers requiring engineering

- `src/app/api/audit/route.ts` uses `node:dns/promises`, `node:net`, and `node:http(s)` for an SSRF-protected HTML audit with DNS/IP pinning. A direct switch to Workers `fetch` would remove important security guarantees. **Do not silently replace this with ordinary fetch or bypass the private-network validation.** Adapt the transport while maintaining protections and test public-IP, DNS-rebinding, redirect, response-size, and timeout edge cases. If not possible, retain a separate, protected origin for this endpoint until a compatible safe solution is available.
- `auth.ts` and `middleware.ts` use Auth.js v5 Google sign-in and JWT sessions. Workers compatibility, cookies, and callback URLs must be tested end to end, not inferred from a successful build.
- Cloudflare Worker preview must receive `AUTH_SECRET`, Google OAuth client ID and client secret through encrypted secret bindings or secure deployment environment; never commit secret values or expose them in `NEXT_PUBLIC_*`.
- `next.config.ts` currently specifies `output: "standalone"` for Hetzner; the Workers build must use the Cloudflare-specific output without breaking the existing production build.

## Non-destructive preflight

The `cloudflare-vinext-preflight.yml` workflow runs `vinext check`, creates a parallel Cloudflare build in CI only, and builds it. This is a diagnostic; a green build does not establish runtime or authentication safety.

## Cutover acceptance criteria

1. Vinext compatibility, bundle and CI tests pass.
2. Cloudflare preview is isolated and has HTTP `X-Robots-Tag: noindex, nofollow`.
3. Test all API routes, especially SEO audit, backlink endpoints, Google One Tap and Auth.js.
4. Confirm OAuth authorized redirect URI matches final `https://shopes.online/api/auth/callback/google` and test sign-in/sign-out/session refresh.
5. Test site crawling and SSRF protections with adversarial redirects, private IPs and DNS changes.
6. Verify all blog, sitemap, robots, canonical, dashboard and static asset routes, and compare with old origin.
7. Check Cloudflare usage and cost; no paid products without approval.
8. Only after verified preview, change apex/WWW Worker routes and keep Hetzner for rollback. Preserve TXT/CAA and all unrelated DNS records.

Do **not** cut over Shopes if its audit endpoint is degraded or its Google login has not been tested.
