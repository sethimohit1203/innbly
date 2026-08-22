# SEO Strategy — innbly.com

**Prepared:** 2026-08-13 | **Business:** India-focused, Airbnb-style vacation rental marketplace (villas, cabins, cottages, farmhouses, holiday homes) | **Baseline health score:** 34/100 (Poor) per `FULL-AUDIT-REPORT.md`

**Template note**: this plan is built from the seo-plan skill's `assets/local-service.md` template — the closest fit available (multi-destination, location-anchored pages; reviews and quick decisions matter). It is **adapted**, not applied as-is: innbly is a multi-sided marketplace with programmatic destination×property-type pages, not a single-location service business with a service area. Where the template assumes one business address and phone number, this plan substitutes "one listing/host network per destination" and drops the LocalBusiness/GBP sections that don't apply to a marketplace with no single physical premises.

---

## 1. Situation Summary

The audit found a single dominant root cause depressing every other score: **the site is pure client-side-rendered React with no SSR/SSG/prerendering.** Every URL (`/`, `/goa`, `/property/p1`, `/blog`, `/search`) returns the byte-identical 5KB `index.html` shell (`<div id="root"></div>`). Any crawler that doesn't execute JavaScript — most non-Google bots, link-preview scrapers, and (critically for GEO) most AI crawlers like GPTBot/ClaudeBot/PerplexityBot — currently sees **zero unique content or metadata on any page except the homepage.**

This is not one issue among several; it is the ceiling on every other score in the audit:
- Technical (20/100) and On-Page (15/100) are low almost entirely because of it.
- Content Quality (30/100) can't be assessed at all for non-JS fetches because of it.
- Schema (45/100) is only half-credited because per-page JSON-LD is client-injected only.

Two structural things work in the site's favor and should not be disturbed while fixing the above: the static `Organization`/`WebSite` JSON-LD hardcoded in `index.html`, and `public/llms.txt`, which is unusually candid about placeholder data — a genuine GEO trust asset.

**Strategic implication**: this plan sequences differently from a typical SEO plan. Normally Phase 1 is "foundation + core pages," Phase 2 is "content expansion." Here, **no volume of new content (destination pages, blog posts, programmatic pages) will get indexed with correct titles/descriptions/schema until the CSR gap and the canonical/sitemap issues are fixed** — so Phase 1 is almost entirely technical, and content scaling is deliberately gated behind it. See `IMPLEMENTATION-ROADMAP.md`.

## 2. Business Context

- **Audience**: India-based leisure travelers searching for villas/cabins/farmhouses in Goa, Manali, Shimla, Jaipur, Udaipur, Mussoorie, Coorg, Ooty, Rishikesh, Lonavala — largely mobile, 3G/4G-constrained per the audit's performance section.
- **Monetization**: real Razorpay-powered bookings (2% host commission, 15% guest service fee, `api/_lib/stayBooking.ts`), plus a self-serve host-listing pipeline (Supabase `host_submissions` → admin approval → `approved_listings`).
- **Content sources**: 7 static demo properties (`src/data/properties.ts`), an unbounded number of admin-approved host listings, 10 destination guide pages (`src/data/destinations.ts`), a growing set of programmatic destination×type pages (`src/data/programmaticPages.ts`, currently ~10, allow-listed by design — see Site Structure doc), and an n8n-auto-published Supabase-backed blog (`/blog`, `/blog/:slug`).
- **Competitive set**: Airbnb India, MakeMyTrip Homestays, StayVista, SaffronStays, Vista Rooms — see `COMPETITOR-ANALYSIS.md`.
- **Constraint that shapes technical recommendations**: Vercel Hobby plan caps the deployment at 12 serverless functions (`api/` top-level files); already near/at cap per `CLAUDE.md`. Any new API surface must fold into an existing dispatched route (`api/submit.ts`, `api/price.ts`) rather than add a new file.

## 3. Goals (12-month horizon)

1. Make every indexable URL crawlable with unique, correct metadata and content in raw HTML (close the CSR gap) — the precondition for everything else.
2. Rank destination + property-type combinations ("villas in Goa," "cabins in Manali," "farmhouses near Lonavala") on page 1 for at least the top 10 destination×type pairs.
3. Establish innbly as a citable source in AI answers (ChatGPT, Perplexity, Google AI Overviews) for "vacation rentals in [Indian destination]" queries, building on the existing `llms.txt` asset.
4. Grow organic-driven bookings as a meaningful, trackable acquisition channel alongside paid/referral.
5. Reach and sustain a 75+ SEO health score (re-audited with the same methodology) by month 6.

## 4. Target Keyword Themes

- **Destination hub** intent: "vacation rentals in Goa," "villas in Manali," "holiday homes in Jaipur"
- **Destination × property-type** intent (highest commercial intent, matches `programmaticPages.ts` pattern): "beachfront villas Goa," "pet friendly cabins Manali," "farmhouses near Lonavala for groups"
- **Occasion/collection** intent (matches `quickFilters.ts` collection-tile pattern): "weekend getaway villas near [city]," "work friendly stays with wifi," "family stay villas India"
- **Comparison/consideration**: "villa vs resort India," "Airbnb alternative India," "best vacation rental sites India"
- **Host-side** (secondary funnel): "list my property for rent India," "how to become a host on innbly"
- **Blog/informational**: "best time to visit Goa," "things to do in Manali in winter," "how to host a farmhouse stay"

## 5. E-E-A-T Plan

- **Experience**: destination guides already carry first-person-style local detail (best time to visit, attractions, food, transport per `destinations.ts`) — extend this depth to every programmatic page rather than leaving them as thin filtered listing pages (see Content Calendar).
- **Expertise/Authoritativeness**: add visible author bylines + publish/updated dates on blog posts (audit item #11) — currently unconfirmed in rendered DOM. Since blog content is AI-generated via the n8n/Gemini pipeline, be explicit about human editorial review in an "About this content" note, consistent with the honesty pattern already set by `llms.txt`.
- **Trust**: `llms.txt`'s disclosure that homepage trust stats are placeholders is good for AI crawlers but is a live trust risk for human visitors reading the same numbers as real. Recommend replacing placeholder stats with real figures once available, or removing the stat block rather than showing invented numbers to humans (flagged in audit, elevated here as an E-E-A-T item, not just a technical one).
- Reviews are already handled honestly (`PropertiesContext` only overlays real ratings when real reviews exist, per `CLAUDE.md`) — preserve this pattern as review volume grows; do not backfill with synthetic data.

## 6. Success Criteria Per Phase

| Phase | Primary success signal |
|---|---|
| 1 — Foundation | `curl` on 5 representative URLs returns unique `<title>`/description/canonical/JSON-LD in raw HTML; sitemap contains blog + host-listing URLs; canonical and redirect direction agree |
| 2 — Expansion | All destination and programmatic pages indexed with unique titles in GSC coverage report; blog cadence live; internal linking graph present in raw HTML |
| 3 — Scale | Top 10 destination×type pages ranking page 1-2 for target queries; CWV field data (CrUX) green on mobile; GEO citations observed in at least 2 AI platforms |
| 4 — Authority | Backlink profile growing from genuine outreach/PR; blog cited externally; sustained 75+ health score |

See `IMPLEMENTATION-ROADMAP.md` for the detailed phase breakdown and `SITE-STRUCTURE.md`/`CONTENT-CALENDAR.md` for architecture and content specifics.

## 7. KPI Targets

| Metric | Baseline (Aug 2026) | 3 Month | 6 Month | 12 Month |
|---|---|---|---|---|
| Organic sessions/mo | Not tracked (no GA4 confirmed) | Establish baseline | +50% vs Month-3 baseline | +200% vs Month-3 baseline |
| Indexed pages (GSC coverage) | ~1 effectively (homepage content only, non-JS) | 40+ (all static routes + destinations) | 150+ (+ blog, + programmatic pages, + top host listings) | 400+ (+ full programmatic matrix, + blog archive) |
| Destination×type pages ranking page 1-2 | 0 | 0 (still stabilizing post-fix) | 5 | 15+ |
| SEO health score (this audit methodology) | 34/100 | 55/100 | 70/100 | 80/100 |
| Core Web Vitals (mobile, CrUX) | Unmeasured (lab est. "moderate risk") | Baseline established | LCP < 2.5s, INP < 200ms on 75th percentile | Sustained green across all 3 CWV metrics |
| Referring domains | Unmeasured | Baseline established | +15 genuine referring domains | +50 genuine referring domains |
| AI citation presence (manual spot-check: ChatGPT/Perplexity for "[destination] vacation rentals") | Not appearing | Not appearing (fix not yet propagated) | Appearing for 2-3 destinations | Appearing for 8+ destinations |
| Organic-attributed bookings | Unmeasured | Baseline established | Tracked, non-zero | Meaningful % of total bookings |

## 8. Resource Requirements & Risks

- **Engineering**: the Phase 1 fixes are the highest-skill item in this plan — prerendering/SSR for a Vite SPA is a real engineering project (build-step changes, possibly a Puppeteer post-build script or a switch to a meta-framework), not a content task. Budget accordingly; this is not a "marketing can do this alone" phase.
- **Content**: destination guide writing (travel-knowledgeable copywriter, ideally with actual India-travel familiarity to avoid generic AI-written filler that undermines E-E-A-T) + the existing n8n/Gemini blog pipeline for cadence.
- **Risk — Vercel function cap**: any new API endpoint needed for SEO tooling (e.g., a dynamic OG-image generator, an IndexNow ping endpoint) must fold into `api/submit.ts` or `api/price.ts`'s dispatch pattern, not add a new top-level file, or the whole deployment fails to build (this has happened once already per `CLAUDE.md`).
- **Risk — thin programmatic pages**: `programmaticPages.ts` is deliberately an explicit allow-list, not an open `/:destination/:type` catch-all, specifically to avoid indexing empty-result combinations. Keep this discipline as the matrix grows — see Site Structure doc's quality gates.
- **Risk — re-baselining performance too early**: don't optimize Core Web Vitals against current CSR-only numbers; re-measure after the rendering fix lands (audit item #13).
