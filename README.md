# Shopes SEO Platform

Shopes is an independent, container-first SEO and product-discovery SaaS for online stores. It is intentionally separate from redclause/shopes.online.

## Current foundation

- Responsive marketing homepage and product positioning.
- Store URL input with client-side validation. It does not run a live crawl yet.
- Free, Premium, and Max pricing cards with monthly/yearly display toggle.
- Dashboard preview with an onboarding flow explicitly labelled as demo data.
- Google sign-in implemented with Auth.js v5 / NextAuth beta on the feature/dashboard-ui branch.
- App Router auth handler at /api/auth/[...nextauth], login page at /login, and middleware protecting /dashboard.
- Session strategy uses JWT; sign-out is available in the dashboard.
- Environment variable names are mapped explicitly: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET_ID, and AUTH_SECRET.
- Next.js App Router, TypeScript, reusable visual styling and responsive layouts.
- Docker production image and Docker Compose development workflow.

Not implemented yet: project persistence, real crawling/audits, live keyword data, billing, or live third-party integrations. Do not interpret the landing-page or dashboard preview as evidence that these services are connected. Displayed pricing and limits are initial product-design examples, not active subscriptions.

## Stack

- Next.js App Router + TypeScript
- React and Lucide icons
- Auth.js v5 (next-auth beta) for Google OAuth
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

See .env.example. Never commit real credentials. Configure these variables in the deployment environment:

- AUTH_SECRET: a long, random private secret for Auth.js sessions.
- GOOGLE_CLIENT_ID: Google OAuth client ID.
- GOOGLE_CLIENT_SECRET_ID: Google OAuth client secret; the app explicitly reads this existing variable name (and supports GOOGLE_CLIENT_SECRET as a fallback).
- GOOGLE_REDIRECT_URI: documentation/reference value; the Auth.js App Router handler uses /api/auth/callback/google by default.

For Google OAuth, the authorized redirect URI in Google Cloud Console must exactly match the deployed app's callback URL, for example https://your-preview-domain.vercel.app/api/auth/callback/google.

Other database, Redis, SEO-provider, and billing variables are placeholders for later phases. Never expose private keys in NEXT_PUBLIC_* variables.

## Planned phases

1. Marketing website, design system, pricing, and container foundation.
2. Google OAuth and dashboard access (implemented on the feature branch); onboarding and project persistence remain future work.
3. Safe website crawler, technical audits, keyword-data provider architecture, and indexability monitoring.
4. Product catalogs, feed validation, competitor analysis, and discovery integrations.
5. Security review, automated tests, observability, and production readiness.

## Safety and data integrity

- Demo dashboard figures are illustrative.
- No search engine indexing guarantee is made.
- Search Console access must be authorized separately from Google sign-in.
- Marketplace and third-party integration availability depends on official APIs, permissions, regional eligibility, and provider terms.
- A production crawler must include SSRF protections, DNS/redirect validation, rate limiting, robots.txt handling, and strict response limits.

## Git workflow

Implementation branch: feature/dashboard-ui. PR #4 remains open for review. Do not merge to main without explicit authorization.