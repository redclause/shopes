# Shopes SEO Content-Quality Audit

## Scope

This is a source-level audit of the generated blog content in `src/lib/blog/shopping-articles.ts`. It is not a live-site crawl and does not claim that search engines have indexed or excluded particular URLs.

## Findings

- The generator exposes 100,000 article URLs from combinations of a fixed topic list, theme list, and angle list.
- Titles and descriptions are produced from those combinations rather than from separately researched article briefs.
- Article bodies reuse a fixed sequence of section headings, shared checklist items, reusable section text, and formulaic introductions and conclusions.
- When the generated body is shorter than 10,500 characters, additional paragraphs are appended from reusable text patterns until the length threshold is met.
- The source-level structure therefore creates a high risk of repetitive, low-value pages despite different slugs and some variable text. Character count is not a reliable measure of originality or usefulness.

## Safeguards applied

- Generated article metadata uses `noindex, follow` while content is under editorial review.
- The generated blog index and paginated generated listings use `noindex, follow`.
- The sitemap index now points only to the core sitemap.
- The core sitemap includes only the homepage and public policy pages; it no longer advertises the generated blog listings or the 100,000 generated articles.
- The old article-sitemap chunk endpoint returns HTTP 410 so obsolete sitemap chunks are not presented as current.

These changes preserve the blog pages for visitors while preventing the current generated set from being promoted as search-ready editorial content.

## Conditions to restore indexing

Do not remove the safeguards just because a page is long or its metadata is unique. A page should be considered for indexing only after it has:

1. A distinct search intent and a specific, useful editorial brief.
2. Substantive original guidance that is not a lightly varied version of another page.
3. Accurate, verifiable product/store information where claims depend on facts.
4. A useful answer to the reader's query, including examples or decision criteria appropriate to the topic.
5. A unique title and description that accurately represent the page.
6. Editorial and technical QA, including internal links, canonical URL, mobile layout, and valid structured data.

Prefer a smaller set of genuinely useful guides over automatically indexing all 100,000 template combinations.

## Remaining verification

- **Live deployment:** not verified in this audit. The runtime used for this task could not resolve `shopes.online`, so production HTTP responses, redirects, canonical tags, robots directives, and sitemap responses must be checked from a network that can reach the deployed site.
- **Google Search Console / Bing Webmaster Tools:** account-level indexing, impressions, clicks, and query data were not available to the current connected SEO data source. Verify the property and inspect indexing reports after the deployment is live.
- **Performance and accessibility:** no browser-based Lighthouse, Core Web Vitals, or assistive-technology run was available here. Source review and CI checks are not substitutes for real mobile and accessibility testing.
- **SEO baseline:** record clicks, impressions, CTR, average position, indexed pages, and organic landing pages from Search Console/analytics before making further editorial or indexing changes.

## Rollback note

The safeguards are intentionally conservative. Re-enable indexing gradually for individually reviewed content; do not restore the full generated sitemap by default.
