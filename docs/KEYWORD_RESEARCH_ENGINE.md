# Shopes Keyword Research Engine

The engine is deterministic and local. It makes no external SEO/API requests and needs no database or API credentials. English is the primary interface language; Georgian rules are also available, and more languages can be added.

## Modules

- `src/app/keyword-research/engine.ts`: language rules, normalization, keyword generation, intent heuristics, scores, CSV export, imported dataset validation, and domain-overlap summaries.
- `src/app/keyword-research/KeywordResearchClient.tsx`: authenticated workspace UI, filters, selection, pagination, CSV export, and local CSV/JSON import.
- `tests/keyword-engine.test.mjs`: Node's built-in test coverage for generation, scoring bounds, imports, overlap summaries, and CSV safety.

## Opportunity score

The score is a local prioritization heuristic, not a search-demand estimate, rank probability, or Keyword Difficulty metric.

1. **Specificity (0–100)**: word count contributes up to 65 points; phrase length contributes up to 20; numeric tokens can contribute 5. The result is capped at 100.
2. **Relevance (0–100)**: token overlap with the seed contributes up to 75 points. A phrase containing the normalized seed receives a 25-point bonus; other variations receive a 10-point base bonus. The result is capped at 100.
3. **Shopes Opportunity Score (0–100)**: `round(0.45 × specificity + 0.40 × relevance + intent bonus)`, capped at 100. Intent bonuses: informational 8, commercial 12, transactional 10, local 7, navigational 0, unclassified 3.

This score ranks generated phrases for review only. It does **not** claim that a phrase has low competition, high traffic, or a high probability of ranking.

## Modelled CPC estimate

The UI and CSV export include a **modelled CPC range in USD**, marked low confidence. This is intentionally a rough rule-based placeholder based only on the local intent classification; it is not sourced from bids, ads auctions, or keyword-level observations, and it is not calibrated against real campaigns. Current broad ranges are: informational $0.05–$1.25; commercial $0.25–$2.75; transactional $0.35–$3.50; local $0.20–$2.50; navigational $0.05–$1.50; unclassified $0.05–$1.75. The estimate does not vary by market, niche, or competition and should not be used for budgeting or bidding decisions. The product keeps verified CPC unavailable as a separate concept.

## Intent classification

Intent is heuristic and rule-based. Purchase/price terms map to transactional intent; best/review/comparison terms map to commercial intent; question and guide terms map to informational intent; explicit local modifiers map to local intent. Unmatched phrases remain unclassified. English and Georgian have separate modifier and question dictionaries. Classification should be treated as a suggestion, not a verified label.

## Provenance and metrics

- Generated phrases carry `provenance: locally-generated` and `metricsStatus: unavailable`.
- The UI does not fabricate search volume, measured CPC, paid competition, organic difficulty, rankings, or trends. The separately labelled modelled CPC range is an uncalibrated heuristic, not observed data.
- Market selection is descriptive metadata only; it does not mean the engine has market-specific query data.
- Imported rows retain the filename/source label and import timestamp, and preserve an optional source date when a `source_date`, `date`, or `fetched_at` field is provided. The UI does not independently verify the dataset's source or claim it represents live Google results.

## Import format and safety limits

CSV or JSON imports are processed in the browser, without network requests. Maximum input size is 2 MB and maximum row count is 5,000. Required fields are `keyword` (or `query`) and an absolute `http(s)` `url` (or `link`). Optional fields include `title`, `description`/`snippet`, `rank`/`position`, and `source_date`/`date`/`fetched_at`. Invalid rows are skipped; an import fails if no valid rows remain. Domain frequency, keyword overlap, and average rank are summaries of the supplied dataset, not live measurements.

CSV exports quote cells, escape embedded quotes, and neutralize spreadsheet formula prefixes.

## Limitations and future extension

The local rules can generate plausible variations, but they cannot reveal how often people search for them. Live search metrics require a legitimate data source, and any future integration must be separately approved. This version does not crawl search engines or fetch live SERPs. Additional languages can be added by extending the `RULES` dictionaries and intent rules without changing the scoring and import interfaces.
