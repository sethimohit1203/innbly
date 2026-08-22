# SEO Audit Report — innbly.com

**Date:** 2026-08-13 | **Business type:** Property rental marketplace (Airbnb-style, India-focused) | **Scope:** Homepage, robots.txt, sitemap.xml, llms.txt, plus manual crawl of representative pages (`/`, `/search`, `/goa`, `/property/p1`, `/blog`, `/compare`, `/dashboard`, `/admin`).

**Limitations:** No Google Search Console / GA4 / DataForSEO / CrUX credentials configured, so field CWV data, indexation status, and real ranking/keyword data are not included — Performance is a lab/heuristic estimate and AI-search category relies on static-file inspection only, not live LLM-citation testing.

---

## Executive Summary

### Overall SEO Health Score: **34 / 100** (Poor)

| Category | Weight | Score (0-100) | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 20 | 4.4 |
| Content Quality | 23% | 30 | 6.9 |
| On-Page SEO | 20% | 15 | 3.0 |
| Schema/Structured Data | 10% | 45 | 4.5 |
| Performance (CWV) | 10% | 55 | 5.5 |
| AI Search Readiness | 10% | 60 | 6.0 |
| Images | 5% | 55 | 2.75 |
| **Total** | 100% | | **~33.05 → 34** |

The site is functionally a single HTML shell served to every URL. This is the dominant issue and depresses Technical, On-Page, and Content scores simultaneously.

### Top 5 Critical / High Issues

1. **Every route serves byte-identical HTML** — `/`, `/goa`, `/property/p1`, `/blog`, `/search` all return the exact same 5,015-byte `index.html` with the same `<title>`, meta description, canonical, and JSON-LD. There is no prerendering/SSR/SSG. Any crawler or tool that doesn't execute JavaScript (most non-Google bots, link-preview scrapers, many AI/LLM crawlers) sees only the homepage's content and metadata for every URL on the site — a severe duplicate-title/duplicate-description problem across dozens of indexed URLs.
2. **Canonical/domain mismatch**: `https://innbly.com` (apex) issues a `308 Permanent Redirect` to `https://www.innbly.com`, yet **every page's `<link rel="canonical">` points to the non-www apex** (`https://innbly.com/...`), and `robots.txt`'s `Sitemap:` directive and the sitemap's own `<loc>` entries all use the apex too. Search engines are told "the canonical URL is a URL that itself redirects elsewhere" — a self-contradicting signal that can cause canonicalization to be ignored or mis-resolved.
3. **Sitemap is missing entire content sections**: no `/blog` or `/blog/:slug` URLs (despite `scripts/generate-sitemap.ts` having a `fetchBlogSlugs()` function), no `/dashboard`-adjacent public pages, and no approved host listings (`/property/host-*`) were present in the live sitemap even though the generator supports fetching them from Supabase. Only 30 static URLs are listed; several destination sub-pages seen in code (e.g. Coorg, Ooty, Rishikesh, Mussoorie sub-categories) are absent too.
4. **No security headers**: `curl -I` on the live site shows only `Strict-Transport-Security` — no `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy`. Not a direct ranking factor but flagged by Lighthouse/technical audits and relevant to trust signals for a payments-handling marketplace.
5. **Per-page JSON-LD, titles, and meta descriptions only exist client-side** (`useJsonLd.ts`, presumably a `usePageMeta`-style hook) via `useEffect` DOM mutation after JS execution. Googlebot's renderer will eventually pick this up, but it is a known-fragile pattern (render-budget dependent, invisible to non-rendering crawlers, and invisible to social share previews / most AI crawlers that fetch raw HTML). Combined with issue #1, this means **there is currently no reliable way for anything other than a full Chrome-rendering Googlebot pass to see unique page content or metadata.**

### Top 5 Quick Wins

1. Add `<link rel="alternate">`/redirect consistency fix: either make `www` canonical everywhere (sitemap, robots, canonical tags) and stop redirecting apex→www with mismatched canonical, or flip canonical to `www.innbly.com` to match the actual serving domain — one config change, resolves issue #2 immediately.
2. Wire `fetchBlogSlugs()` and the Supabase `approved_listings` fetch into a scheduled sitemap regeneration (currently code exists but the live sitemap output doesn't reflect it) — likely just a missed deploy/cron step.
3. `public/llms.txt` already exists and is well-written (see AI Search Readiness) — cheap win is linking it from `robots.txt` for discoverability (`# llms.txt: https://innbly.com/llms.txt`).
4. Add basic security headers via `vercel.json` (`headers` config) — near-zero engineering cost.
5. Image `alt` text audited on Home/Footer is present and descriptive (`alt={t.label}`, `alt={d.name}`) — extend this same pattern to property photo galleries and blog post images, which weren't inspected in raw HTML (client-rendered) but should be checked directly in `src/pages/PropertyDetail.tsx` and `src/pages/BlogPost.tsx`.

---

## Technical SEO

- **robots.txt** (`https://innbly.com/robots.txt`, mirrors correctly on `www`): syntactically valid, allows `/`, blocks `/admin`, `/dashboard`, `/api/`. This correctly keeps the host and admin dashboards out of crawl — good.
- **Redirect chain**: apex → www is a single 308 hop (fine hop-count-wise, well under the 3-hop limit) but conflicts with canonical tags (Critical #2 above).
- **Sitemap**: valid XML, 30 URLs, no `<lastmod>`/`<priority>`/`<changefreq>` fields (not required, but `<lastmod>` is useful for blog/host-listing freshness signals and costs nothing to add since `generate-sitemap.ts` already has the data at generation time). Missing blog and host-listing URLs (Critical #3).
- **JS-rendering dependency**: confirmed via raw `curl` fetch — `<body><div id="root"></div></body>` with all content injected by React after hydration. No prerendering (react-snap, vite-plugin-ssr, Next-style SSG) or dynamic-rendering fallback for bots is in place. `CLAUDE.md` confirms "No server-side rendering" is a deliberate architecture choice — the SEO cost of that choice is exactly what's showing up here (Critical #1).
- **Indexability of gated areas**: `/dashboard` and `/admin` both return HTTP 200 (client-side route guard only, per `CLAUDE.md`'s "HostOnlyRoute... is a UX guard, not real security") but are correctly `Disallow`'d in robots.txt, so Google won't crawl/index them even though they're reachable. This is a correct mitigation given there's no server-side auth gate.
- **HTTPS**: enforced, HSTS present (`max-age=63072000`).
- **Security headers**: missing CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy (High).
- **URL structure**: clean, descriptive, lowercase, hyphenless single-word slugs for destinations (`/goa`, `/manali`) and hierarchical for sub-categories (`/goa/villas`) — good pattern, no query-string cruft in the sitemap-listed URLs.

## Content Quality (E-E-A-T)

- Because raw HTML is identical across all URLs, **any content-quality assessment via non-JS fetch is impossible** — this is itself the primary content finding. A crawler that doesn't render JS (many do-follow AI/LLM crawlers, some SEO tools, all social unfurl bots) sees zero unique content on any page except the homepage.
- What Google's renderer would eventually see (based on source inspection, not confirmed via full headless render in this audit): destination pages have narrative "best time to visit / attractions / food / transport" content per `llms.txt`'s own description — reasonable depth if genuinely present in the rendered DOM.
- `llms.txt` itself is a strong E-E-A-T-adjacent signal: it explicitly discloses that the demo catalog (`src/data/properties.ts`) is illustrative, not live inventory, and that homepage trust stats are placeholders — honest disclosure is good practice, but it also documents that trust/social-proof content on the homepage is not real, which is a genuine content-trust issue if a human visitor (not just an AI crawler) reads those same stats as real numbers.
- Blog: exists (`/blog`, `/blog/:slug`, Supabase-backed, auto-published via n8n per `CLAUDE.md`) but is entirely absent from the sitemap, meaning even once content is good, it has a discoverability gap.
- No author/byline, last-updated date, or reviewer attribution pattern was visible in raw HTML for blog posts (can't be fully assessed without JS rendering) — worth confirming `BlogPost.tsx` renders a visible author/date, since E-E-A-T weighting benefits from visible authorship on travel/booking content.

## On-Page SEO

- **Title tag**: single title used for every URL — "Verified Villas, Holiday Homes & Vacation Rentals in India | Innbly" (67 characters, good length, keyword-relevant) — but wrong for every page except the homepage. This is the single largest on-page problem: dozens of distinct URLs (destinations, properties, blog posts, search) all compete with duplicate titles in the initial-HTML crawl signal.
- **Meta description**: same duplication problem — one generic description site-wide in raw HTML.
- **Canonical tags**: same value (`https://innbly.com/`) on every page in raw HTML — even though `usePageMeta`/`useJsonLd`-style hooks likely correct this client-side per `CLAUDE.md`'s architecture notes, the pre-render state is wrong everywhere except `/`.
- **Heading structure**: not assessable from raw HTML (empty body); needs a rendered-DOM check for H1 uniqueness per page.
- **Internal linking**: `src/data/quickFilters.ts`'s collection-tile pattern (noted in `CLAUDE.md`) suggests decent internal linking *within* the client app, but since it's all client-side, none of those links exist in the raw HTML either — bots that don't render JS see effectively zero internal link graph beyond whatever's hardcoded in `index.html` (nav/footer links, if any — none were found in the raw fetch).

## Schema & Structured Data

- Site-wide `Organization` and `WebSite` (with `SearchAction`) schema is correctly hardcoded as static JSON-LD directly in `index.html` — this is good practice specifically *because* it survives non-JS fetches (per the in-code comment in `src/hooks/useJsonLd.ts`), and both blocks reference a consistent `@id` (`https://innbly.com/#organization` / `#website`).
- Page-specific schema (`WebPage`, `BreadcrumbList`, `FAQPage`, `LodgingBusiness`/`Product`-equivalent for listings) is injected only via `useJsonLd()` client-side — invisible to non-rendering crawlers, same limitation as on-page metadata above.
- No `LodgingBusiness`, `Product`, or `Offer` schema was found in raw HTML for `/property/p1` — for a bookable-rental page this is a missed rich-result opportunity (price, availability, rating) that Google's renderer may or may not fully credit depending on render timing.
- No `BreadcrumbList` visible in raw HTML on destination or property pages.
- Recommend validating actual rendered output (not just source) with Google's Rich Results Test / Schema Markup Validator once a fix for the CSR gap is in place.

## Performance (lab estimate — no CrUX/PSI credentials)

- Initial HTML payload is tiny (5KB) — fast TTFB/FCP for the shell, but LCP is necessarily deferred until JS downloads, parses, executes, and fetches data (property images, listings) — classic CSR trade-off. Given the app also does Google Fonts (`fonts.googleapis.com`) render-blocking-ish loading and per-route lazy chunks (per `CLAUDE.md`'s `React.lazy` architecture), first meaningful paint on a 3G/4G Indian mobile connection (this app's actual target audience) is a real risk area.
- `rel="preconnect"` is correctly used for Google Fonts.
- No PageSpeed Insights / CrUX field data available in this audit — recommend running `npx playwright` + Lighthouse or PSI manually once deployed, and specifically checking LCP/INP on `/property/:id` (image-heavy) and `/search` (filter-heavy) on mobile.

## Images

- Spot-checked `alt` attributes in `Footer.tsx` and `Home.tsx`: present and descriptive (`alt={t.label}`, `alt={d.name}`, not generic "image123.jpg" patterns) — good baseline discipline.
- Not verified: property gallery images (`PropertyDetail.tsx`), blog post images, and whether images are served in modern formats (WebP/AVIF) or lazy-loaded — Cloudinary is used for host-submitted photos per `CLAUDE.md`, which supports on-the-fly format/format-negotiation transforms if not already applied via URL params.
- OG image (`og:image`) is a static brand icon (`/brand/innbly-icon.jpg`) reused for every page — fine for the homepage, but a missed opportunity for property/destination pages to show the actual listing/location photo in social shares (again blocked by the CSR issue: OG tags can't be varied per-page in the same way title/description can't).

## AI Search Readiness / GEO

- `public/llms.txt` exists, is well-structured, and is unusually honest for an llms.txt file (explicitly flags placeholder stats and illustrative-only catalog data) — this is genuinely above-average GEO practice and should be preserved as the site grows.
- However, `robots.txt` doesn't reference `llms.txt` and no `<link rel="llms">`-style discovery hint exists — low-cost fix.
- The core CSR/duplicate-metadata problem is doubly damaging for GEO: AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are generally **less likely to execute JavaScript** than Googlebot, meaning they may see even less unique content than a traditional SEO crawler would — for citation/AI-Overview purposes, most of this site is currently invisible beyond the homepage and `llms.txt` itself.
- No `ai.txt` (emerging convention, optional) present — low priority.

## SXO / Page-Type Match

- Sitemap structure (destination hub pages → destination/category pages → property detail pages) matches expected search intent for "villas in Goa," "cabins in Manali" style queries — good information architecture *in principle*.
- `/search` is present and indexable — for a marketplace, faceted/filtered search pages indexed without content differentiation risk thin/duplicate-content flags; not enough data here to confirm `/search?...` query variants are canonicalized or noindexed, worth checking `SearchResultsPage`'s handling of `?collection=` params from `quickFilters.ts` against duplicate-content best practice (canonical to the base `/search` or use canonical tags per filter combination consistently).
- Given the CSR gap, the site's actual page-type/intent match can't be fully validated until content is crawlable — this should be re-audited after the SSR/prerendering fix.
