# Site Structure — innbly.com

Builds on the existing route architecture (`src/App.tsx`), destination-page pattern (`src/data/destinations.ts`), programmatic page allow-list (`src/data/programmaticPages.ts`), and collection-tile pattern (`src/data/quickFilters.ts`) — not a rebuild.

## Current URL Hierarchy (as implemented)

```
/                                   Home (static bundle, not lazy)
/search                             Full listing search + ?collection=<quickFilters slug>
/property/:id                       Property detail (static catalog "p1".. + host listings "host-*")
/host/:id                           Host profile page
/compare                            Saved-listing comparison
/blog                               Blog index (Supabase-backed, n8n auto-published)
/blog/:slug                         Blog post
/goa, /manali, /shimla,
/jaipur, /udaipur, /mussoorie,
/coorg, /ooty, /rishikesh,
/lonavala                           Destination hub pages (DESTINATIONS in destinations.ts)
/goa/villas, /goa/beachfront-villas,
/manali/cabins, /shimla/cottages, …  Programmatic destination×type pages (explicit allow-list, PROGRAMMATIC_PAGES)
/contact, /privacy-policy, /terms   Static utility pages
/saved, /bookings, /profile,
/invite                             Session-scoped tenant pages (correctly not sitemap candidates)
/dashboard/*                        Host-only, HostOnlyRoute-gated, robots.txt-disallowed — correct as-is
/admin/*                            Admin-only, robots.txt-disallowed — correct as-is
/enterprise/*                       Separate demo product area, deliberately unlinked to marketplace data — exclude from marketplace sitemap
```

## What Belongs in the Sitemap (and currently doesn't — Critical #3)

The sitemap generator (`scripts/generate-sitemap.ts`) already has the logic; the live output is missing sections. Target sitemap composition:

1. Home, all static utility pages (`/contact`, `/privacy-policy`, `/terms`), `/search`, `/compare`, `/blog`
2. All 10 destination hub pages (`DESTINATIONS`)
3. All programmatic pages currently in `PROGRAMMATIC_PAGES` (audit item #14 — also expand this list, see below)
4. `fetchBlogSlugs()` output — every `/blog/:slug` from `published_blog_posts`
5. `fetchApprovedHostListings()` output — every `/property/host-*` from `approved_listings`
6. Static catalog property pages (`/property/p1` … `/property/p7`)

Explicitly **excluded**: `/dashboard/*`, `/admin/*`, `/saved`, `/bookings`, `/profile`, `/invite`, `/enterprise/*` — session-scoped or separate-product surfaces, correctly kept out per current `robots.txt` disallow rules.

## Programmatic Page Expansion — Quality-Gated

`PROGRAMMATIC_PAGES` is intentionally an explicit, hand-maintained allow-list, not an open `/:destination/:type` catch-all — the in-code comment is explicit about avoiding thin duplicate pages for combinations with zero matching properties. This plan keeps that discipline and adds numeric gates, adapted from the local-service template's location-page quality gates:

| Gate | Rule |
|---|---|
| Minimum inventory | Only add a destination×type page when ≥3 matching properties exist (static catalog + approved host listings combined) — below that, route the query to `/search?city=X&type=Y` instead of a dedicated indexable page |
| Minimum unique content | Each programmatic page needs its own `intro` (already required by `ProgrammaticPageConfig`) of at least 150 words of genuinely distinguishing copy — not a template with only the destination name swapped — plus at least one destination-specific detail (a neighborhood, a landmark, a seasonal note) not copied from the parent destination page |
| Growth warning | 30+ live programmatic pages: audit for thin-content drift before adding more |
| Hard stop | 60+ live programmatic pages: pause expansion, re-audit unique-content ratio and indexation rate in GSC before continuing — a large unindexed tail of near-duplicate filtered pages is a known Google Panda-style risk for marketplaces |

Current gap to fill first (audit item #14, lower-competition than Goa/Manali): Coorg, Ooty, Rishikesh, Mussoorie have destination hub pages but no `/villas`, `/cabins`, `/farmhouses` sub-pages yet — natural next additions once real inventory supports them.

## Collection Pages (`/search?collection=<slug>`)

`quickFilters.ts` defines 23 named filter predicates (near-metro, pet-friendly, luxury, budget-picks, weekend, etc.), all currently surfaced only as `/search?collection=X` query-param views. Per audit item #9, decide and implement **one** consistent policy — recommendation:

- **Tier A (indexable as their own landing pages)**: collections with clear standalone search intent and reasonable volume — `pool`, `pet-friendly`, `beach`, `luxury`, `budget-picks`, `weekend`, `family-stay`, `work-friendly`. Give these a canonical self-referencing `<link rel="canonical">`, a unique title/meta description ("Pet Friendly Villas & Homestays in India | Innbly"), and treat them as a lightweight version of the programmatic-page pattern.
- **Tier B (canonicalize to base `/search`)**: narrower/operational filters unlikely to carry standalone search intent — `near-metro`, `senior-friendly`, `corporate`, `digital-nomad`, `high-speed-wifi`, `parking`. These stay useful as on-site filter chips but shouldn't compete for their own indexed URL; canonical them back to `/search`.

Don't leave this undecided (the audit's explicit finding) — pick the split above (or a revised one) and encode it in `SearchResultsPage`'s canonical logic once the CSR fix (Phase 1) makes canonical tags reliably crawlable at all.

## Internal Linking Strategy

- **Destination hub → programmatic sub-pages → property detail**: this hierarchy already exists in the route structure; make it exist in the *rendered HTML* internal-link graph too (currently invisible pre-render per the audit) once Phase 1 lands. Add explicit "Explore villas in Goa" / "Explore cabins in Manali" links from each destination hub page to its programmatic children.
- **Collection tiles → `/search?collection=`**: already shared across hero quick-chips, category nav, and the lifestyle explorer per `CLAUDE.md` — good single-source-of-truth pattern; keep it (don't hand-roll a second query-param scheme per component, as the file's own comment warns).
- **Blog → destination/property pages**: every blog post about a destination should link to that destination's hub page and at least one relevant programmatic page — currently likely absent since blog is new; add as a standing content requirement (see `CONTENT-CALENDAR.md`).
- **Breadcrumbs** (audit item #7): add visible + schema breadcrumbs Home → Destination → Type → Property on property and programmatic pages — improves both crawl-graph clarity and SXO.

## Domain / Canonical Structure (Critical #1 and #2)

Single decision needed, applied consistently across `index.html`, `scripts/generate-sitemap.ts`'s `SITE_URL`, `public/robots.txt`'s `Sitemap:` line, and any per-page canonical hook:

- **Recommended**: make `https://www.innbly.com` canonical everywhere, since the apex→www 308 redirect is already live traffic behavior — lower-risk than flipping the redirect direction.
- Apply the same host consistently to `og:url`, JSON-LD `@id`/`url` fields, and the sitemap's own `<loc>` entries.

## Schema Map by Page Type

| Page type | Schema |
|---|---|
| Home | `Organization`, `WebSite` + `SearchAction` (already static in `index.html` — keep) |
| Destination hub | `WebPage`/`TouristDestination`-adjacent (or `CollectionPage`), `BreadcrumbList` |
| Programmatic destination×type page | `CollectionPage` or `ItemList` of properties, `BreadcrumbList` |
| Property detail | `LodgingBusiness` or `Product`+`Offer` (price, INR, availability), `AggregateRating`/`Review` (only when real reviews exist — never fabricate), `BreadcrumbList` |
| Blog post | `BlogPosting`, `BreadcrumbList` (already planned per `CLAUDE.md`'s `useJsonLd` pattern on `BlogPost.tsx`) |
| Host profile | `Person`/`ProfilePage`-adjacent, optional |
| Search | none needed — noindex or canonical to base `/search` per Tier B collections above |

All of the above must additionally be present in **raw HTML**, not only client-injected, once Phase 1's rendering fix lands — schema alone doesn't fix invisibility to non-JS crawlers.
