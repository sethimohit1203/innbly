# SEO Action Plan — innbly.com

Prioritized fixes, each referencing actual files in this repo. See `FULL-AUDIT-REPORT.md` for the
full findings this plan addresses. Health Score: 34/100.

---

## Critical (fix immediately — indexing/duplicate-content blockers)

### 1. Fix canonical/domain mismatch (apex redirects to www, but canonical says apex)
- **Problem**: `https://innbly.com` 308-redirects to `https://www.innbly.com`, but every page's
  `<link rel="canonical">`, `robots.txt`'s `Sitemap:` line, and every `<loc>` in `sitemap.xml` all
  point at the non-www apex — a URL that itself redirects away.
- **Fix**: Pick one canonical host and make everything agree with it. Given the redirect already
  sends traffic to `www`, the lower-risk fix is to make `www.innbly.com` canonical everywhere:
  - `index.html`: change `<link rel="canonical" href="https://innbly.com/" />` and all
    `og:url`/`twitter` URLs to the `www` host, and update the hardcoded JSON-LD `@id`/`url` fields
    (`https://innbly.com/#organization`, `#website`) to match.
  - `scripts/generate-sitemap.ts`: change `const SITE_URL = 'https://innbly.com'` to
    `'https://www.innbly.com'`.
  - `public/robots.txt` (or wherever it's generated/served — check for a `generate-robots`
    equivalent): update `Sitemap: https://innbly.com/sitemap.xml` to the `www` URL.
  - Any per-page canonical-setting hook (the `usePageMeta`-style hook referenced by
    `src/hooks/useJsonLd.ts`'s comments) needs the same base-URL constant updated.
  - Alternative: flip the redirect direction (www→apex) instead and keep canonicals as-is — pick
    whichever is less disruptive to already-indexed URLs/backlinks; do not leave the mismatch as-is.

### 2. Eliminate duplicate title/meta-description/canonical across all routes (CSR gap)
- **Problem**: Every URL returns byte-identical raw HTML (confirmed via `curl` on `/`, `/goa`,
  `/property/p1`, `/blog`, `/search` — all 5,015 bytes, identical `<title>`, description,
  canonical, JSON-LD). No prerendering/SSR exists; content and per-page `<head>` tags are injected
  entirely by client-side JS after hydration.
- **Fix** (pick one, in order of effort/impact):
  1. **Prerendering** (lowest-disruption): add a prerender step to the Vite build for known static
     routes (home, destinations, `/search`, `/blog`, `/blog/:slug` from Supabase, `/property/:id`
     for the static catalog) using a tool like `vite-plugin-prerender` or a custom Puppeteer-based
     post-build script that visits each route from `scripts/generate-sitemap.ts`'s URL list and
     writes the rendered HTML to `dist/<route>/index.html`. This directly reuses the URL list
     `generate-sitemap.ts` already computes.
  2. **Dynamic rendering fallback**: detect bot user-agents in a Vercel Edge Middleware/rewrite and
     serve a server-rendered (e.g. via a headless-Chrome rendering service or Vercel's own ISR-like
     pattern) snapshot only to crawlers, while humans still get the CSR SPA. More infra, but no
     client-code changes needed.
  3. **Minimum-viable partial fix**: at least make the static `<title>`/`<meta description>`/
     `<link canonical>` in `index.html` route-aware isn't possible without a build step per route —
     so if 1/2 aren't feasible short-term, this is the one finding that structurally requires a
     rendering change, not a metadata tweak.
- This single fix also resolves most of the On-Page and half the Content Quality score loss.

### 3. Get blog and host-listing URLs into the live sitemap
- **Problem**: `scripts/generate-sitemap.ts` already has `fetchBlogSlugs()` (queries
  `published_blog_posts` via Supabase) and `fetchApprovedHostListings()` (queries
  `approved_listings`), but the live `sitemap.xml` at `https://innbly.com/sitemap.xml` contains
  neither — only 30 static URLs, zero `/blog/*` or `/property/host-*` entries.
- **Fix**: Confirm the sitemap-generation script is actually wired into the deploy pipeline (check
  `package.json`'s `build` script and any Vercel build command / cron for a step that runs
  `scripts/generate-sitemap.ts` and commits/uploads the output before each deploy — or set up a
  scheduled regeneration, since blog posts publish on their own n8n schedule independent of code
  deploys). Also confirm `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are present in the build
  environment where this script runs — the script silently skips both dynamic sections and logs a
  warning if those env vars are missing, which could be exactly what happened here.

---

## High (fix within 1 week)

### 4. Add security headers
- **Fix**: add a `headers` block to `vercel.json` covering all routes:
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `SAMEORIGIN`),
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (restrict
  camera/microphone/geolocation as unused), and a `Content-Security-Policy` scoped to the app's
  actual origins (Supabase, Cloudinary, Razorpay, Google Fonts, Vercel) — build the CSP carefully
  since the app loads scripts/fonts/images from several third-party origins per `CLAUDE.md`.

### 5. Link llms.txt from robots.txt and verify it stays accurate as the site grows
- **Fix**: add a comment line to `robots.txt` (e.g. `# llms.txt: https://innbly.com/llms.txt` —
  wherever robots.txt is generated) so it's programmatically discoverable, and add a checklist item
  to future `public/llms.txt` edits (it already correctly flags placeholder stats — keep that habit
  as real booking-volume data becomes available, per its own existing "Notes for AI assistants"
  section).

### 6. Add per-listing structured data (LodgingBusiness/Product + Offer + AggregateRating)
- **Fix**: in `src/pages/PropertyDetail.tsx`, use the existing `useJsonLd()` hook
  (`src/hooks/useJsonLd.ts`) to inject `LodgingBusiness` or `Product`-with-`Offer` schema (price,
  currency INR, availability) plus `AggregateRating`/`Review` schema sourced from the real
  `reviews` table data already fetched by `PropertiesContext` (per `CLAUDE.md`'s Reviews section —
  don't fabricate ratings for unrated properties, mirror the existing "honest defaults" rule).
  This is still client-side-only until fix #2 (CSR) lands, but is a correct no-regret addition
  either way and will be picked up once rendering-crawlers/prerendering see it.

### 7. Add BreadcrumbList schema + visible breadcrumbs on destination and property pages
- **Fix**: same `useJsonLd()` pattern, e.g. Home > Goa > Villas > [Property Name]. Improves both
  schema coverage and internal linking/SXO structure once crawlable.

---

## Medium (fix within 1 month)

### 8. Add `<lastmod>` to sitemap entries
- **Fix**: `scripts/generate-sitemap.ts` already has the data needed for blog posts (Supabase
  `published_blog_posts` likely has an updated timestamp) — add `<lastmod>` per URL, at minimum for
  dynamic content (blog, host listings) where freshness is a real signal.

### 9. Audit and standardize `/search?...` query-parameter canonicalization
- **Fix**: check `src/pages/SearchResultsPage.tsx`'s handling of `?collection=<slug>` params from
  `src/data/quickFilters.ts`. Decide and implement consistently: either canonical-tag every filtered
  view back to the base `/search` (if filtered results aren't meant to rank individually) or give
  each `collection` slug its own canonical + unique title/description (if they are meant to rank,
  e.g. "beachfront villas in Goa" as its own landing intent) — don't leave it undefined.

### 10. Vary OG image per page type
- **Fix**: for property pages, use the listing's first Cloudinary photo as `og:image` instead of the
  static brand icon; for destination pages, use the destination hero image. Requires fix #2 (CSR)
  to actually take effect for link-preview bots, but implement the per-page value in whatever
  `usePageMeta`-equivalent hook sets `og:title`/`og:description` today.

### 11. Verify author/date visibility on blog posts
- **Fix**: confirm `src/pages/BlogPost.tsx` renders a visible byline/publish date in the DOM (not
  just in schema) — check against the `blog_posts` table's stored author/published_at columns
  (`supabase/blog_posts.sql`). Add if missing; this is a standard E-E-A-T signal for AI-authored
  content per the n8n auto-blogging pipeline described in `CLAUDE.md`.

---

## Low (backlog)

### 12. Consider an `ai.txt` file
- Optional, emerging convention alongside `llms.txt` — low priority, no urgency.

### 13. Re-run Lighthouse/PSI once CSR fix (#2) lands
- Lab performance numbers pre-fix are not representative of what crawlers/users will experience
  post-prerendering; re-baseline CWV after that change rather than optimizing against current numbers.

### 14. Expand programmatic destination coverage in sitemap
- `PROGRAMMATIC_PAGES` / `DESTINATIONS` in `src/data/` likely support more sub-category combinations
  (e.g. Coorg, Ooty, Rishikesh, Mussoorie currently have base pages but no `/villas`, `/cabins`
  sub-pages like Goa/Manali/Shimla/Lonavala/Jaipur do) — audit `src/data/programmaticPages.ts`
  against what's actually in the sitemap and fill gaps if genuine content exists for them.
