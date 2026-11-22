# Shopes — production Google OAuth configuration and post-cutover checks

The Cloudflare Worker named `shopes-migration-preview` now powers the **production Custom Domains** `shopes.online` and `www.shopes.online`. The internal Worker name was retained to preserve its existing encrypted secrets and GitHub Builds connection; it is no longer a preview deployment. Its old `workers.dev` URL is disabled.

## Google Cloud configuration

Create or maintain an **OAuth 2.0 Web application**, not a generic Google API key.

Authorized JavaScript origins:
- `https://shopes.online`
- `https://www.shopes.online`

Authorized redirect URIs:
- `https://shopes.online/api/auth/callback/google`
- `https://www.shopes.online/api/auth/callback/google`

If Google publishing status is Testing, add intended test users to the Audience test list.

## Runtime bindings

The Worker has the following secret bindings:
- `GOOGLE_CLIENT_ID_RUNTIME` (public ID stored as a Worker secret to survive build configuration replacement)
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`
- `SHOPES_CLOUDFLARE_RUNTIME` (Cloudflare audit transport marker)

Do not copy or expose secret values in Git, CI, logs or chat. The client ID is served separately by `/api/google-client-config`.

Google authentication uses the configured OAuth secret, JWT sessions, CSRF and PKCE. `trustHost: true` derives the callback domain from the current request.

## Verified and remaining checks

Automated tests **passed** on both live production hosts:
- Indexable home, blog, robots.txt and sitemap; Login and health return 200.
- Google OAuth starts with 302 to Google, includes PKCE, and carries the correct host-specific callback URI.
- Protected SEO Audit rejects an unauthenticated POST with HTTP 401.
- The Cloudflare audit transport validates public DNS, private network/SSRF guards, redirects and response limits in tests.

A human Google user still needs to confirm the **actual OAuth callback**, signed-in dashboard/session persistence, logout, One Tap, and a successful **authenticated audit of a public website** (e.g. `https://imageto.one`). Do not call these checks verified until they are exercised in a real browser.

The original Hetzner hosting is no longer the public origin but must be shut down separately on the shared VPS. Do not stop the VPS itself, which hosts unrelated applications.
