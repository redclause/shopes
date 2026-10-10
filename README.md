# Shopes SEO Platform

Shopes is an independent, container-first SEO and product-discovery SaaS for online stores. It is intentionally separate from `redclause/shopes.online`.

## Current foundation

- Responsive marketing homepage and product positioning.
- Store URL input with client-side validation. It does not run a live crawl yet.
- Free, Premium, and Max pricing cards with monthly/yearly display toggle.
- Dashboard preview with onboarding flow explicitly labelled as demo data.
- Google sign-in implemented with Auth.js v5 / NextAuth beta on the `feature/main-google-oauth` branch.
- App Router auth handler at `/api/auth/[...nextauth]`, login page at `/login`, and middleware protecting `/dashboard`.
- Session strategy uses JWT.
- Environment variables: `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET_ID` (with `GOOGLE_CLIENT_SECRET` fallback).
- PostgreSQL/Redis, project persistence, real crawling/audits, live keyword data, billing, and live third-party integrations are not implemented.

## Stack

- Next.js App Router + TypeScript
- React and Lucide icons
- Auth.js v5 (NextAuth beta) for Google OAuth
- Docker / Docker Compose

## Run locally

Requirements: Node.js 22+ and npm.

    npm install
    cp .env.example .env.local
    npm run dev

Open http://localhost:3000.

## Environment variables and Google OAuth

Configure these variables in the deployment environment; never commit real credentials:

- `AUTH_SECRET`: a long, random private secret for Auth.js sessions.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET_ID`: Google OAuth client secret. The app also supports `GOOGLE_CLIENT_SECRET` as a fallback.
- `GOOGLE_REDIRECT_URI`: documentation/reference value. Auth.js uses the App Router callback path by default.

For the beta domain, register this exact authorized redirect URI on the same Google OAuth client used by the beta deployment:

`https://shopes-beta.vercel.app/api/auth/callback/google`

The callback URL must match exactly. Deployment Protection may also affect whether the browser can reach the beta app and callback. Do not expose credentials in browser-side variables such as `NEXT_PUBLIC_*`.

## Validation

Run `npm run lint`, `npm run typecheck`, and `npm run build`. A successful build does not prove that the live Google OAuth flow works; test sign-in and callback on the deployed beta domain.

## Git workflow

This implementation is isolated on `feature/main-google-oauth`. Do not merge to `main` or deploy to Production without explicit authorization.
