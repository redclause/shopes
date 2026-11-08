# Shop directory

`/shops` is a public directory module, linked from the homepage navigation, footer, and signed-in user menu. It does not require a database, paid API, or login.

Features: responsive cards, name/domain/category search, category filtering, 24-item pagination, a native accessible shop-details dialog, and favorites persisted in browser localStorage. Dialogs support Escape, outside click, focus containment, and return focus to the opening button. Invalid saved data is discarded; unavailable storage falls back to session memory.

## Catalog provenance

Candidate merchant names and domains were discovered in the public [Shopify master list](https://github.com/growthenginenowoslawski/shopify-master-list), snapshot dated July 20, 2026. Only records marked Active/keep with at least 20 listed products were selected. Selection prioritizes directly checked storefronts; the remaining candidates require explicit retail/category wording in their merchant name. The initial release contains 1,200 distinct domains, including 652 direct storefront checks. Revenue, visits, prices, followers, and other estimates are not displayed or redistributed. Domain/name facts are used for discovery, not copied marketing descriptions.

`src/lib/shops/catalog.json` contains the public directory. `docs/shop-directory-evidence.json` records each listing's snapshot and the available direct storefront evidence. A direct check means a successful page response containing at least three product links and a cart/add-to-cart signal; it is not a purchase test or a trust/safety certification. Listings without a direct check explicitly state that current availability has not been independently confirmed. Categories use explicit retail wording in the merchant name or checked page title. Category assignments are conservative; uncategorized shops appear under More shops.

The catalog is a snapshot, not a real-time availability service. It makes no claims about shipping coverage, customer reviews, prices, or merchant quality. Links go directly to merchants, without affiliate parameters. No third-party logo/favicons or tracking requests are loaded by directory browsing.

To maintain it, inspect the official merchant site, update its name/category/URL, record dated evidence, and remove closed or non-storefront sites. Keep IDs stable for saved favorites. Update the public source note when the snapshot changes.

## Validation

- `npm run test:shops`: catalog count and unique domains, source evidence, combined search filters, invalid/stale saved data.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- `node scripts/smoke-production-routes.mjs http://127.0.0.1:3000`: built route checks, including `/shops`.

Existing stale blog tests and the AI Lab smoke expectation were aligned with the repository's already-published sitemap/indexing and SEO snippet studio changes. Application behavior for those features is unchanged.
