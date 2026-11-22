# Shopes Cloudflare migration — OAuth setup and release gate

The Hetzner service is **still production**. The Cloudflare Worker `shopes-migration-preview` is isolated and carries `noindex`. Do not change production DNS until Google authentication **and** the technical SEO Audit pass functional and security tests.

## Google Cloud

Use **Google Auth Platform → Clients → Web application** (OAuth 2.0; NOT an API key).

Authorized JavaScript origins:
- `https://shopes.online`
- `https://www.shopes.online`
- `https://shopes-migration-preview.egreegregio.workers.dev`

Authorized redirect URIs:
- `https://shopes.online/api/auth/callback/google`
- `https://www.shopes.online/api/auth/callback/google`
- `https://shopes-migration-preview.egreegregio.workers.dev/api/auth/callback/google`

Configure Google Auth Platform → Audience. For a project in Testing mode, add each human tester to Test users.

## Cloudflare preview runtime — variables and secrets

Workers & Pages → `shopes-migration-preview` → Settings → Variables and Secrets:
- `GOOGLE_CLIENT_ID`: **Text** (OAuth client ID is public).
- `GOOGLE_CLIENT_SECRET`: **Secret** (never post or commit).
- `AUTH_SECRET`: **Secret** (already provisioned for preview on 2026-11-22). Retain this securely; do not publish or expose it. Production must use its own stable secret; reusing Hetzner's existing Auth.js secret is preferred for zero forced logouts, if existing session cookies are to remain valid.

The public OAuth Client ID is now fetched at runtime via `GET /api/auth/google-one-tap/config`. No client ID needs to be embedded in Cloudflare Builds. Do not set `AUTH_URL` to production on the preview: `trustHost: true` in `auth.ts` derives the incoming preview hostname.

The application supports `GOOGLE_CLIENT_SECRET` (or legacy names `CLIENT_SECRET_ID_GOOGLE` and `GOOGLE_CLIENT_SECRET_ID`); use exactly one new canonical name.

All secrets go directly into Cloudflare's encrypted Worker secrets. Never paste the secret into this repository, GitHub Actions job logs, build variables or chat.

## Required verification before cutover

1. `GET /api/auth/google-one-tap/config` returns the public Client ID, and no other OAuth secrets.
2. `GET /api/auth/providers` responds with 200 and includes Google and Google One Tap.
3. Google OAuth callback succeeds on the preview domain, and both standard sign-in and One Tap are tested with a real authorized user. JWT cookies, session reads, sign-out and dashboard protection work across page reloads.
4. The SEO Audit endpoint must not be silently downgraded to a non-pinned fetch. The Hetzner implementation validates DNS answers and pins requests to the checked IP, which the Workers `node:http` wrapper does not support. It currently deliberately returns 503 on preview until a secure replacement or an explicitly approved, authenticated hybrid-backend integration is verified.
5. Verify noindex on previews, correct canonical/meta, and indexability (no noindex) on eventual production Worker. Test pages, API routes, and concurrency.
6. Preserve Hetzner as immediate rollback until production stability is observed. Avoid enabling fees, paid services, databases or Redis for this migration without explicit approval.

## Status

- Cloudflare preview successfully deployed and public route smoke test passed before Google secrets.
- Runtime-only public Client ID endpoint added on `migration/cloudflare-runtime-preview` branch.
- `AUTH_SECRET` securely provisioned on preview; Google OAuth client credentials pending.
- Audit is deliberately fail-closed. **Production migration is NOT ready yet**.
