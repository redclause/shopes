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

**Not implemented yet:** Google authentication, persistence, real crawling/audits, live keyword data, billing, or live third-party integrations. Do not interpret the landing-page preview as evidence that these services are connected. Displayed pricing and limits are initial product-design examples, not active subscriptions.

## Stack

- Next.js App Router + TypeScript
- React and Lucide icons
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

See `.env.example`. Never commit real credentials. Google OAuth, database, Redis, billing, and SEO-provider variables are placeholders for later phases; the current landing page does not require them.

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
