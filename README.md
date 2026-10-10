# Shopes SEO Platform

Shopes is an independent, container-first SEO and product-discovery SaaS for online stores. It is intentionally separate from `redclause/shopes.online`.

## Phase 1 foundation

- Premium responsive marketing homepage and product positioning.
- Store URL input with client-side validation. It does **not** run a live crawl yet.
- Free, Premium, and Max pricing cards with monthly/yearly display toggle.
- Illustrative dashboard preview clearly labelled as demo/example data.
- SEO audit, keyword research, product discovery, competitor and integration sections.
- Next.js App Router, React, TypeScript, reusable visual styling and responsive layouts.
- Docker production image and Docker Compose local development workflow.
- Environment variable template with placeholders only.

**Not implemented yet:** project persistence, real crawling/audits, live keyword data, billing, or live third-party integrations. Do not interpret the landing-page preview as evidence that these services are connected. Displayed pricing and limits are initial product-design examples, not active subscriptions.

## Stack

- Next.js App Router + TypeScript
- React and Lucide icons
- Auth.js v5 (NextAuth beta) for Google OAuth on `feature/main-google-oauth`
- PostgreSQL/Redis are intentionally deferred until project persistence and background crawl jobs are designed.
- Docker / Docker Compose

## Run locally

Requirements: Node.js 22+ and npm.

    npm install
    cp .env.example .env.local
    npm run dev

Open http://localhost:3000.

## Run with Docker

    docker compose up --build

Open http://localhost:3000. Compose is intended for local development; the multi-stage Dockerfile builds a standalone production image.

## Environment variables

See `.env.example`. Never commit real credentials. Google OAuth variables are required to use sign-in; database, Redis, billing, and SEO-provider variables remain placeholders.

## Google OAuth configuration

Auth.js v5 handles Google sign-in through the App Router route at `/api/auth/[...nextauth]`. The login page is `/login`, and middleware protects `/dashboard`; other pages remain public. Sessions use JWT strategy.

Set these server-side environment variables:

- `AUTH_SECRET`: a long, random secret for Auth.js.
- `GOOGLE_CLIENT_ID`: the Google OAuth client ID.
- `CLIENT_SECRET_ID_GOOGLE`: supported client-secret variable name.
- `GOOGLE_CLIENT_SECRET_ID`: also supported. For compatibility, `GOOGLE_CLIENT_SECRET` is accepted as a fallback. The client ID (`GOOGLE_CLIENT_ID`) and `AUTH_SECRET` are still required; the client secret variable cannot replace them.
- `GOOGLE_API_KEY` is not used for Google sign-in. An API key is different from an OAuth client ID/secret and will not resolve Google's `401 invalid_client` error.
- `GOOGLE_REDIRECT_URI`: documentation/reference only; Auth.js uses its default App Router callback path.

For the beta domain, register this exact authorized redirect URI on the same Google OAuth client configured in the beta deployment:

`https://shopes-beta.vercel.app/api/auth/callback/google`

Redirect URI matching is exact. Vercel Deployment Protection may affect access to preview pages and callbacks. Do not place secrets in `NEXT_PUBLIC_*` variables.

A successful build does not prove live Google OAuth works. Test sign-in end to end on the deployed beta app before considering the callback verified.

## Planned phases

1. Marketing website, design system, pricing, container foundation.
2. Google OAuth, onboarding, project persistence, subscription entitlements.
3. Safe website crawler, technical audits, keyword-data provider architecture, indexability monitoring.
4. Product catalogs, feed validation, competitor analysis, discovery integrations.
5. Security review, automated tests, observability, production deployment.

## Safety and data integrity

- Demo dashboard figures are illustrative.
- No search engine indexing guarantee is made.
- Search Console access must be authorized separately from Google sign-in.
- Marketplace and third-party integration availability depends on official APIs, permissions, regional eligibility, and provider terms.
- A production crawler must include SSRF protections, DNS/redirect validation, rate limiting, robots.txt handling, and strict response limits.

## Git workflow

Implementation branch: `feature/ecommerce-seo-saas-foundation`. Do not merge to `main` without explicit authorization.
