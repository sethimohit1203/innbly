# Content Calendar — innbly.com

Content work is sequenced to start only once Phase 1 (rendering/indexability fixes, see `IMPLEMENTATION-ROADMAP.md`) is underway — new content written against a CSR-only site gets the same "invisible except to full-render Googlebot" treatment as everything else in the audit. Where content work can proceed in parallel with Phase 1 engineering (writing, not publishing-and-expecting-indexation), that's called out explicitly.

## Content Types & Cadence

| Content type | Cadence | Owner | Notes |
|---|---|---|---|
| Destination hub pages | One-time backfill + refresh quarterly | Content writer | 10 exist (`destinations.ts`); refresh `bestTimeToVisit`/`attractions` yearly, expand narrative depth where thin |
| Programmatic destination×type pages | 2-4 new per month, gated by inventory (see `SITE-STRUCTURE.md` quality gates) | Content writer + eng (predicate wiring) | Fill Coorg/Ooty/Rishikesh/Mussoorie villa/cabin sub-pages first (lowest competition, audit item #14) |
| Blog posts | 2-4/month via existing n8n auto-blogging pipeline (`n8n-workflows/innbly-auto-blogging.json`) | n8n workflow (Gemini-drafted) + editorial review | Editorial review step is new — see E-E-A-T note below |
| Collection landing pages (Tier A, per `SITE-STRUCTURE.md`) | One-time setup for 8 tiers, then stable | Content writer + eng | pool, pet-friendly, beach, luxury, budget-picks, weekend, family-stay, work-friendly |
| Host-side content (listing guide, commission explainer) | One-time, 3-4 pages | Content writer | Underserved niche vs. curated-brand competitors per `COMPETITOR-ANALYSIS.md` |
| Property detail content depth | Ongoing, tied to host onboarding | Product/ops | Improve amenity/landmark detail captured at submission time so listing pages aren't thin |

## Phase-Aligned Content Roadmap

### Weeks 1-4 (parallel to Phase 1 engineering — writing only, not expecting indexation yet)
- Draft/finalize the `LodgingBusiness`/`Product` schema copy needs (price framing, availability language) alongside engineering's schema implementation (Action Plan #6).
- Write breadcrumb label conventions (Home > Destination > Type > Property) to hand to engineering for Action Plan #7.
- Audit and rewrite the homepage trust-stat block (replace placeholder numbers or remove — see `SEO-STRATEGY.md` E-E-A-T section) — this is copy work, not blocked by CSR fix, ship it independently.
- Confirm/add visible author byline + publish date pattern on `BlogPost.tsx` (Action Plan #11) — coordinate copy (author name/bio format) with engineering.

### Weeks 5-12 (Phase 2 — once static routes are prerendering correctly)
- Backfill full 600+ word destination-guide-quality content for all 10 destination hub pages where current depth is thin (audit couldn't confirm depth from raw HTML — verify against rendered DOM first).
- Publish first wave of programmatic destination×type pages: Coorg villas, Ooty cottages, Rishikesh riverside stays, Mussoorie cabins — each with the 150+ word unique intro required by the quality gate in `SITE-STRUCTURE.md`.
- Launch Tier A collection landing pages (8 pages) with unique titles/descriptions/canonical.
- Blog: publish first 6-8 posts via the n8n pipeline covering destination guides ("Best time to visit Manali," "Things to do in Goa off-season") and hosting topics ("How commission works for hosts on innbly").
- Internal-link every new page per the linking strategy in `SITE-STRUCTURE.md` (destination → programmatic children, blog → destination/property).

### Weeks 13-24 (Phase 3 — scale)
- Expand programmatic matrix toward the 30-page warning gate — prioritize destinations with real inventory growth from the host-approval pipeline over speculative combinations.
- Blog cadence sustained at 3-4/month; introduce a recurring "hosting economics" sub-series (commission comparisons, payout process, becoming a host) building on the host-side content gap identified in `COMPETITOR-ANALYSIS.md`.
- Add comparison content ("innbly vs Airbnb India," "villa vs resort for group trips") — clearly the site's own opinion/comparison content, not impersonating competitors.
- Begin outreach-driven guest content / co-marketing with travel bloggers for genuine backlinks (see Roadmap Phase 3).

### Months 7-12 (Phase 4 — authority)
- Thought-leadership content: hosting-market data pieces (e.g., "What Indian vacation-rental hosts earn," sourced from innbly's own aggregate, anonymized data once volume supports it — never fabricated).
- PR-driven content around real bookings milestones (replacing the placeholder trust stats with real, citable numbers).
- Expand destination coverage beyond the current 10 as host inventory in new cities crosses the 3-property minimum gate.

## E-E-A-T / Editorial Notes for the Auto-Blogging Pipeline

The n8n workflow (Gemini AI Agent drafts, Pexels supplies cover images, publish via `api/submit.ts`'s `type: 'blogPost'` branch) is efficient but needs a human editorial checkpoint before this plan's cadence assumes full trust:
- Add a review step (even lightweight) before a post's `status` allows public visibility, checking for factual accuracy on India-travel specifics (season dates, local regulations, transport details) — AI-drafted travel content is a known hallucination risk on specifics like exact opening hours or permit requirements.
- Keep the existing byline/date pattern honest — if content is AI-drafted with human review, say so plainly, consistent with `llms.txt`'s existing disclosure habit rather than presenting it as fully human-authored.

## Content Backlog (not yet scheduled, revisit after Phase 2)

- FAQ page/schema for common tenant questions (cancellation policy, deposit handling — deposits were deliberately unbundled from online charge per recent commit history, worth a dedicated explainer).
- Seasonal/occasion collection pages if quickFilters gains new tags (e.g., "New Year villas," "long weekend getaways") — same Tier A/B decision framework applies.
- `ai.txt` (audit item #12, low priority, optional emerging convention).
