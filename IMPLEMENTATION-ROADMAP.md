# Implementation Roadmap — innbly.com

Sequenced deliberately around the audit's central finding: **the CSR/no-prerendering gap, the canonical/domain mismatch, and the sitemap gaps must be fixed before any content-scaling work pays off** — content published against a site where every URL serves identical raw HTML doesn't get indexed correctly regardless of quality. Phase 1 is therefore almost entirely technical engineering, not the usual "core pages + light setup" mix.

References `FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md` throughout — this roadmap sequences and phases those findings rather than re-deriving them.

---

## Phase 1: Foundation (Weeks 1-4) — Fix the indexability crisis

**Everything in this phase blocks Phase 2. Do not start bulk content production until these are verified.**

1. **Close the CSR gap** (Action Plan #2, audit Critical #1) — the single highest-leverage item in this entire plan.
   - Preferred approach: add a prerendering post-build step reusing the URL list `scripts/generate-sitemap.ts` already computes (home, destinations, programmatic pages, `/search`, `/blog` + slugs, `/property/:id` for static + approved host listings) — write rendered HTML to `dist/<route>/index.html`.
   - Alternative: bot-detected dynamic rendering via Vercel Edge Middleware.
   - Verify with raw `curl` (no JS execution) on at least 5 representative URLs (`/`, `/goa`, `/goa/villas`, `/property/p1`, `/blog/<a-real-slug>`) — each must return a unique `<title>`, meta description, canonical, and JSON-LD in the raw response.

2. **Fix canonical/domain mismatch** (Action Plan #1, audit Critical #2) — make `www.innbly.com` canonical everywhere: `index.html`'s canonical/og:url/JSON-LD `@id`, `scripts/generate-sitemap.ts`'s `SITE_URL`, `public/robots.txt`'s `Sitemap:` line, and the per-page meta hook. Low effort, ship independently of #1, immediately resolves a self-contradicting signal.

3. **Fix the live sitemap gap** (Action Plan #3, audit Critical #3) — confirm `fetchBlogSlugs()`/`fetchApprovedHostListings()` actually run in the deploy pipeline and that `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are present in that build environment (the script silently skips otherwise). Verify the live `sitemap.xml` contains `/blog/*` and `/property/host-*` URLs post-fix.

4. **Security headers** (Action Plan #4) — add a `headers` block to `vercel.json` (CSP scoped to Supabase/Cloudinary/Razorpay/Google Fonts/Vercel origins, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy). Independent, near-zero-cost, ship anytime in this window.

5. **Link `llms.txt` from `robots.txt`** (Action Plan #5) — one line, ship immediately.

6. **Analytics/tracking baseline** — confirm GA4 (or equivalent) and Google Search Console are actually connected and verified for `www.innbly.com` (matching the canonical decision in #2) before Phase 2 content starts, so KPI baselines in `SEO-STRATEGY.md` can be measured rather than assumed.

**Phase 1 exit criteria**: raw-HTML crawl of 5+ representative URLs shows unique metadata; canonical/redirect/sitemap all agree on one host; sitemap contains blog + host-listing URLs; GSC verified and receiving data.

---

## Phase 2: Expansion (Weeks 5-12) — Content and schema, now that it's crawlable

1. **Per-page structured data** (Action Plan #6, #7): `LodgingBusiness`/`Product`+`Offer`+`AggregateRating` on `PropertyDetail.tsx`, `BreadcrumbList` + visible breadcrumbs on destination/programmatic/property pages, via the existing `useJsonLd()` hook.
2. **Search/collection canonicalization decision** (Action Plan #9): implement the Tier A/B split from `SITE-STRUCTURE.md` in `SearchResultsPage.tsx`.
3. **Content rollout**: destination-guide depth backfill, first wave of programmatic pages (Coorg/Ooty/Rishikesh/Mussoorie sub-pages), Tier A collection landing pages, first 6-8 blog posts — see `CONTENT-CALENDAR.md` for full detail.
4. **Internal linking**: wire destination → programmatic-children and blog → destination/property links per `SITE-STRUCTURE.md`.
5. **`<lastmod>` in sitemap** (Action Plan #8) — cheap addition once blog/host-listing sections are live in the sitemap.
6. **OG image variation** (Action Plan #10): per-listing Cloudinary photo, per-destination hero image — only meaningfully effective post-Phase-1 for link-preview bots.
7. **Author/date visibility on blog** (Action Plan #11) plus the editorial-review checkpoint described in `CONTENT-CALENDAR.md`.

**Phase 2 exit criteria**: GSC coverage report shows 40+ indexed pages with distinct titles; internal link graph visible in raw HTML; blog cadence live; Tier A/B collection decision implemented and canonical-consistent.

---

## Phase 3: Scale (Weeks 13-24)

1. **Programmatic matrix expansion** toward (not past) the 30-page warning gate in `SITE-STRUCTURE.md`, tied to real inventory growth via the host-approval pipeline.
2. **GEO optimization**: re-verify `llms.txt` accuracy as real booking data replaces placeholders; spot-check AI citation presence (ChatGPT, Perplexity, Google AI Overviews) for target destination queries; ensure AI crawlers (GPTBot, ClaudeBot, PerplexityBot) are not blocked in `robots.txt` and can access the now-prerendered content.
3. **Performance re-baseline** (Action Plan #13): run Lighthouse/PSI/CrUX properly for the first time against the prerendered site — do not compare against Phase-0 CSR numbers.
4. **Genuine outreach/link building**: travel-blogger co-marketing, comparison/PR content per `CONTENT-CALENDAR.md`, targeting the referring-domain KPI in `SEO-STRATEGY.md`.
5. **`/search?...` faceted-query audit**: confirm no thin/duplicate combinations are leaking into the index outside the Tier A/B policy as filter usage grows.

**Phase 3 exit criteria**: top 10 destination×type pages ranking page 1-2 for target queries; CrUX field data available and trending toward green; at least 2 AI platforms surfacing innbly content in spot-checks.

---

## Phase 4: Authority (Months 7-12)

1. Thought-leadership / data-driven content (real, anonymized hosting-market figures) once volume supports it — never fabricated, consistent with the site's existing honesty pattern.
2. PR around real booking milestones, replacing the last placeholder trust stats.
3. Advanced schema and continuous technical optimization — re-run the full audit methodology and compare against the 34/100 baseline.
4. Sustained blog/programmatic-page cadence with quality gates still enforced (30/60-page warnings from `SITE-STRUCTURE.md` remain active, not one-time checks).

**Phase 4 exit criteria**: sustained 75-80+ health score on re-audit; organic-attributed bookings tracked as a meaningful channel; referring-domain growth from genuine outreach, not directory spam.

---

## Cross-Phase Guardrails

- **Vercel 12-function cap**: any new API surface needed for SEO tooling folds into `api/submit.ts`/`api/price.ts`'s dispatch pattern — verify function count (`git ls-tree -r HEAD -- name-only api/ | grep -v _lib`) before adding a new top-level file, at every phase.
- **No fabricated data**: trust stats, ratings, and reviews all follow the existing "honest defaults, never invented numbers" pattern (`mapApprovedListing.ts`, `PropertiesContext`'s reviews overlay) — extend, don't violate, this pattern in any new content or schema work.
- **Don't skip Phase 1 exit criteria**: if engineering timelines slip, hold Phase 2 content publication rather than publishing into a still-CSR-only site — publishing early doesn't get credited once the fix lands; it just delays the moment indexation actually reflects the fix.
