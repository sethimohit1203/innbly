# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Vite client (5183) + local API server (8797) together, via concurrently
npm run dev:client      # Vite only
npm run dev:api         # Local API server only (tsx watch scripts/dev-api-server.ts)
npm run build           # tsc -b (typecheck src/) && vite build
npm run typecheck:api   # Typecheck api/ separately — NOT covered by `npm run build` or tsc -b
npm run preview         # Preview the production build
npm run test:e2e        # Playwright suite (equivalent to `npx playwright test`)
npx playwright test e2e/navigation.spec.ts        # Run one spec file
npx playwright test -g "some test name"           # Run tests matching a title
```

Ports are pinned deliberately (`vite.config.ts`, `scripts/dev-api-server.ts`) to 5183 (client),
4183 (preview), 8797 (local API) — not Vite's defaults — so this project can run alongside other
local projects without port collisions. `strictPort: true` on both, so a clash fails loudly
instead of silently binding elsewhere.

Playwright's `webServer` config (`playwright.config.ts`) runs `npm run dev` automatically, so
`npx playwright test` works standalone — no need to start the dev server first. It reuses an
already-running server outside CI.

There is no separate lint script; `tsc -b` (client) and `tsc --noEmit -p api/tsconfig.json` (API)
are the only static checks. Run both before committing.

**Playwright flakiness note**: some tests have occasionally failed transiently under heavy local
system load (many Chrome/dev-server processes from parallel tool use) — timeouts and strict-mode
double-matches that don't reproduce on a clean re-run. If a test fails, re-run it in isolation
(`-g "test name" --repeat-each=3`) before treating it as a real regression.

## Architecture

Three data layers in one repo: a Vite/React SPA (`src/`), Vercel serverless functions (`api/`,
bridged locally by `scripts/dev-api-server.ts`), and a Supabase project (real Postgres + Storage)
that backs only the host-listing submission/approval flow — everything else still runs on the
static catalog + Google Sheets pattern described below.

### Client (`src/`)

- Vite + React 18 + TypeScript + Tailwind, React Router (all routes declared in `App.tsx`). No
  server-side rendering. Every route except Home is `React.lazy`-loaded behind a `<Suspense>`
  boundary in `App.tsx` to keep the initial bundle small — the host form (react-hook-form + zod +
  Supabase), `/admin`, and the whole `/enterprise` demo area only download when visited.
- `src/data/properties.ts` is the static demo catalog (typed by `src/types.ts`), 7 hand-written
  listings. It is **not** the only source of listings anymore — see PropertiesContext below.
- `src/context/PropertiesContext.tsx` is the actual data source every page should read from
  (`useProperties()` → `{ properties, getPropertyById }`). On mount it merges the static catalog
  with any Supabase rows in the `approved_listings` view (host submissions an admin has approved),
  mapped through `src/lib/mapApprovedListing.ts` — fields the host form doesn't collect (rating,
  reviews, landmarks, wifi speed…) get honest "new/unrated" defaults, never fabricated numbers.
  Home, SearchResults, PropertyDetail, and HostProfile consume this; a few secondary
  surfaces (TrendingDestinations, quickFilters aggregate views) still read the static array
  directly — a known, accepted gap, not an oversight.
- `src/data/quickFilters.ts` defines named filter predicates (`slug` + `(p: Property) => boolean`)
  shared by hero quick-chips, the category nav, the collections grid, and the lifestyle explorer.
  They all link to `/search?collection=<slug>`, and `SearchResultsPage` looks up and applies the
  predicate. Adding a new "collection" tile anywhere means adding one entry here — don't hand-roll
  a new query-param scheme per component.
- State that needs to persist across a session (saved properties, recently viewed, compare list,
  saved searches, leads, auth, toasts) lives in `src/context/*`, composed once in
  `AppProviders.tsx`. Each localStorage-backed context follows the same pattern: React state
  initialized from `localStorage`, written back via `useEffect`.
- `src/hooks/useServerPrice.ts` is the only sanctioned way to show a price on screen. It debounces
  a POST to `/api/price` and renders whatever the server returns — **no page computes a rupee
  amount client-side**. See "Pricing is server-authoritative" below.
- `/enterprise/*` (`src/pages/enterprise/`, `src/components/enterprise/`) is a separate demo
  product area — a hotel-operator PMS/booking-engine pitch — that intentionally does not share
  data or components with the tenant-facing marketplace. Don't wire the two together.
- `HostOnlyRoute` gates `/dashboard` and `/dashboard/list-property` client-side by
  `useAuth().user?.role === 'host'`. This is a UX guard, not real security — there is no backend
  session tied to it (see Auth model below).
- Both the Host Dashboard and Admin Dashboard are nested-route layouts, not single pages with
  anchor-scroll sections: `HostDashboardLayout`/`AdminLayout` render a shared header + tab nav and
  a React Router `<Outlet>`, with each tab (`/dashboard`, `/dashboard/properties`,
  `/dashboard/leads` and `/admin`, `/admin/properties`, `/admin/bookings`, `/admin/leads`,
  `/admin/messages`) as its own lazy-loaded page component under `src/pages/host/` and
  `src/pages/admin/`. `AdminLayout` owns all the auth/data-fetching state and passes it down via
  `Outlet context` (`useAdminData()`) rather than each tab fetching independently.

### Auth model (real accounts, real sessions — as of the password/OTP rebuild)

Tenant/host auth is now real: `api/auth.ts` (single `action`-dispatched route, see "API" below)
handles signup, email-OTP verification, login, role switching, and profile updates against a
`public.users` table (`supabase/users.sql`) with `node:crypto.scrypt`-hashed passwords — no
`bcrypt`/`bcryptjs` dependency needed, scrypt is built into Node. `api/_lib/userAuth.ts` holds the
password hashing, the signed session cookie (`innbly_session`, HMAC'd with `USER_SESSION_SECRET`,
embeds `{userId, role}`), and OTP hashing (`OTP_SECRET`) — both are Vercel env vars, not
client-exposed, and deliberately separate from the admin session's `ADMIN_SESSION_SECRET` so the
two trust boundaries can't cross-contaminate each other.

- **Signup requires an emailed 6-digit code** before a session issues (`supabase/otp_codes.sql`,
  10-minute expiry, 5 attempts) — matches Airbnb's own flow, where OTP only confirms identity once
  at signup, not on every login. The email is sent via the **existing Google Apps Script pipeline**
  (`google-apps-script/Code.gs`'s `sendOtpEmail`, a new `'otp'` `doPost` branch that skips the
  usual sheet-row logging), not a new paid transactional email service — same ~100/day Gmail quota
  as every other email this app sends. Unlike every other `forwardToSheet` call site (fire-and-forget,
  see "API" below), OTP delivery uses `sendViaAppsScriptAwaited()` (`api/_lib/sheets.ts`) so
  `api/auth.ts` knows whether the email actually sent before telling the user "code sent."
- `src/context/AuthContext.tsx`'s `user` is now hydrated from `GET /api/auth?action=session` on
  mount (the httpOnly cookie is the source of truth), not read from `localStorage` — a page reload
  re-verifies the session server-side rather than trusting whatever was last written to the browser.
  `user`'s shape (`name`, `email`, `role`, `phone?`, `avatarUrl?`) is unchanged from before, so every
  existing `useAuth()` call site kept working without edits.
- **Google Sign-In** (`GoogleSignInButton`) still only decodes the ID token client-side without
  verifying its signature against Google's JWKS server-side — flagged in `api/auth.ts`'s
  `google-auth` action as a known gap, not silently glossed over. It does now get a real session
  cookie via that action, unlike the old fully-local fake login.
- **Role switching** ("Switch to travelling"/"Switch to hosting" in `Navbar.tsx`) just flips
  `users.role` via `api/auth.ts`'s `switch-role` action — same self-serve semantics as before
  (anyone can become a host), now persisted server-side instead of localStorage.
- Email can't be changed from `/profile` (`update-profile` action intentionally omits it) — it's
  now a real login credential, not just a display field, so changing it needs its own re-verification
  flow that doesn't exist yet (flagged as a future gap, not built).
- `api/auth.ts` is the route that pushed this deployment to **12/12** of Vercel's Hobby function
  cap (see below) — there is no more headroom for a new top-level `api/*.ts` file without folding
  into an existing one or upgrading the plan.

The **admin dashboard** (`/admin`, `api/admin/*`) remains its own separate, older real-auth system:
a passcode checked server-side (`api/_lib/adminAuth.ts`) against `ADMIN_PASSCODE`, with an
HMAC-signed session cookie (`ADMIN_SESSION_SECRET`). Don't conflate the two — an admin session
proves nothing about a tenant/host identity and vice versa.

### API (`api/`) — Google Sheets side

**Vercel's Hobby (free) plan caps a deployment at 12 serverless functions** — every `.ts`/`.js`
file directly under `api/` (nested folders included) counts as one, except anything under an
`_`-prefixed folder like `api/_lib/`. This has already been hit once: adding the booking flow's 3
new routes pushed the count to 14 and every deployment failed at build time with "No more than 12
Serverless Functions can be added to a Deployment on the Hobby plan" — silently, with production
just staying pinned to the last successful build, which looked like "my push didn't deploy."
Before adding a new top-level `api/*.ts` file, count the existing ones (`git ls-tree -r HEAD --
name-only api/ | grep -v _lib` is quick) or fold the new endpoint into an existing file with a
`type`/`kind` dispatch field instead (see `api/submit.ts` and `api/price.ts` for the pattern).

Every write (leads, signups, newsletter, contact, host-listing backup) goes through one shared
route, `api/submit.ts` (dispatched on a `type` field — see the file itself for why: it used to be
five separate route files, consolidated for the function-count reason above), instead of hitting
an external Google Apps Script URL directly from the browser. This is deliberate: `SHEETS_WEBAPP_URL`
and the admin secrets are server-only env vars (no `VITE_` prefix) so they never end up in the
client bundle. See `google-apps-script/README.md` for the Sheets backend setup this all forwards
to (`google-apps-script/Code.gs` is the actual Apps Script source — edit it there, then re-paste
into the Apps Script editor and redeploy; this repo copy is not auto-synced).

- `api/_lib/pricing.ts` holds every pricing formula (nightly estimator, booking totals, ROI
  calculator, the 7-day price calendar). `api/price.ts` dispatches on a `kind` field. **All
  property prices are nightly rates**, not monthly — don't reintroduce a `/30` or `×30` conversion.
- `api/_lib/rateLimit.ts` is an in-memory per-warm-instance limiter — best-effort, not a hard
  guarantee across serverless instances, acceptable at this scale (Upstash Redis is the natural
  upgrade later).
- `api/tsconfig.json` is a **separate** TypeScript project from the root one. `tsc -b` does not
  typecheck `api/` — always run `npm run typecheck:api` too.
- `scripts/dev-api-server.ts` mounts the same `api/*.ts` handler files locally. If you add a new
  `api/*.ts` file, you must also register it in the `ROUTES` map in this file or it 404s locally
  (Vercel itself needs no such registration — every file under `api/` is automatically a route).
- `vercel.json` rewrites everything except `/api/*` to `/index.html` — required for client-side
  routing to work on refresh/direct-navigation in production.

### Supabase — the host-listing approval pipeline

This is the one part of the app backed by a real database. Flow: host fills the multi-step form
(`src/pages/ListProperty.tsx`) → `src/lib/hostSubmission.ts` uploads photos/documents to
**Cloudinary** (see below) and inserts a row into `host_submissions` (status `pending`) directly
from the browser using the **anon key** → best-effort mirrors the same data to the Google Sheets
backend (backup + email notification) → an admin reviews it in `/admin`'s "Property Approvals"
panel and approves/rejects → approved rows become visible through the public `approved_listings`
Postgres view → `PropertiesContext` picks them up and they appear everywhere a demo listing would.

- One SQL file must be run once in the Supabase SQL Editor — it is **not** applied automatically,
  there is no migration runner: `supabase/host_submissions.sql` creates `host_submissions` (RLS
  enabled, anon can only INSERT, never SELECT/UPDATE/DELETE). It also creates a `host-uploads`
  Storage bucket, which is unused now that uploads go to Cloudinary — left in place rather than
  torn out, since dropping it isn't required for anything to work.
  `supabase/host_submissions_approval.sql` — adds the `approved_listings` view (public SELECT,
  owner_email deliberately excluded) that the site's public pages actually query.
- `src/lib/cloudinary.ts` uploads photos/documents directly from the browser to Cloudinary via an
  **unsigned upload preset** (`VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET`, both
  client-exposed by design — an unsigned preset can only accept uploads into its own configured
  folder, it can't read/list/delete anything, same trust model as the Supabase anon key). Chosen
  over Supabase Storage because Supabase's free tier is only 1GB, easily exhausted by listing
  photos, versus Cloudinary's free tier (~25GB storage+bandwidth/month) built for exactly this.
- Three env vars, three different trust levels — don't mix them up:
  - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — client-exposed by design (anon key is meant
    to be public; RLS is what enforces access, not secrecy of this key).
  - `SUPABASE_SERVICE_ROLE_KEY` — server-only, no `VITE_` prefix, bypasses RLS entirely. Only ever
    imported by `api/_lib/supabaseAdmin.ts`, called from `api/admin/host-listings.ts`,
    `api/admin/bookings.ts`, and `api/bookings/verify.ts` (payment verification needs to both write
    the `bookings` row and read `host_submissions.owner_email` for payout tracking) — every caller
    gated behind `verifyAdminSession()` except `verify.ts`, which is instead gated behind its own
    independent Razorpay signature check (see below). Never import `supabaseAdmin.ts` from `src/`.
- `src/lib/supabase.ts` exports `supabase: SupabaseClient | null` — it's `null` (with a console
  warning) if the env vars are missing, specifically so a misconfigured/missing key degrades to
  "the host form doesn't work" rather than crashing the entire app at load (this happened once:
  `createClient()` throws synchronously on an empty URL, taking down `#root` for every visitor).
  Always keep this nullable/guarded pattern when touching this file.

### Bookings & payments — Razorpay

Tenant-facing "Reserve & Pay" on `PropertyDetail` (both static demo properties and approved host
listings) is a real payment flow, not a stub — `api/_lib/stayBooking.ts` is the pricing engine
(separate from `api/_lib/pricing.ts`'s `computeBookingTotal`, which is exclusively used by the
unrelated `/enterprise` demo — don't conflate the two).

- Commission model (a deliberate undercut of Airbnb's typical split-fee rates to compete on price):
  host pays **2%** of the room subtotal, guest pays a **15%** service fee — bundled into a single
  guest-facing "price for N nights" line (`src/components/BookingModal.tsx`) rather than shown as
  its own row, though the server-side breakdown (and hosts/admin) still see `guestServiceFee` broken
  out separately — plus an estimated GST (12%/18% two-tier slab on the nightly rate — **this is a
  display estimate only**; confirm the actual applicable slab and any GST-registration requirement
  with a tax advisor before relying on it for compliance, nothing here files or remits GST). All of
  this is computed in
  `computeStayBookingBreakdown()` and re-derived from scratch server-side in both
  `api/bookings/create-order.ts` and `api/bookings/verify.ts` — never trust client-supplied amounts.
- Flow: `create-order.ts` computes the price and opens a Razorpay order (test or live, based on
  whatever `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are set) → the browser opens Razorpay Checkout
  (`src/lib/razorpay.ts`) → on success, `verify.ts` independently verifies the HMAC-SHA256 payment
  signature (never trusts a client-reported "payment succeeded"), recomputes the price breakdown
  again, and inserts into the `bookings` table using the service-role key. There's an idempotency
  check on `razorpay_payment_id` so a retried verify call can't create duplicate bookings.
- `supabase/bookings.sql` (run once, same one-time-SQL-Editor pattern as the other Supabase files)
  creates the `bookings` table with RLS enabled and **zero policies** — unlike `host_submissions`,
  there's no anon insert policy at all, since payment verification always happens server-side
  anyway (see above), so there was never a reason to let the browser write directly.
- **No automatic payout to hosts** — that requires Razorpay Route (a separate marketplace product
  needing per-host KYC-verified linked accounts, a business approval process, not just API keys).
  Until that's set up, `/admin/bookings` shows what each host is owed after commission and an admin
  manually pays them (bank/UPI) and marks the booking `paid` there.
- "Chat with Host" (the WhatsApp deep link) is gated behind a completed payment — `src/lib/
  myBookings.ts` tracks paid property ids in localStorage (same pattern as `myListings.ts`) so the
  host's real contact info isn't shown to a tenant who hasn't paid through the site yet.
- Google Sheets mirroring for a confirmed booking happens directly from `verify.ts` (server-side),
  unlike host-listing submissions which mirror from the browser — there's no client round-trip
  needed since verification already runs server-side. `Code.gs`'s `sendBookingEmails()` notifies
  admin, host, and tenant, each with only what they need (host gets the guest's contact + payout
  amount, tenant gets a receipt).

### Host-configurable pricing & calendar

Hosts can now manage their own listing's pricing beyond the flat `price_per_night` set at
submission time — weekend markup, a "smart pricing" starter-default toggle, cleaning/pet/extra-guest
fees, and a per-date price calendar. Since there's no real host login (see Auth model above),
ownership here is a **per-listing access code** (`host_submissions.access_code`), not email-matching:

- `supabase/host_listing_pricing.sql` (run once) adds `access_code`, `weekend_adjustment_pct`,
  `smart_pricing_enabled`, `cleaning_fee`, `pet_fee`, `extra_guest_fee` to `host_submissions`, and a
  new `listing_date_prices` table (per-date overrides) with RLS enabled and **zero policies** — every
  read/write goes through the service-role key, never anon. `approved_listings` exposes the new
  non-secret columns; `access_code` is never added to that view.
- The access code is generated client-side at submission time (`src/lib/hostSubmission.ts`,
  same "anon can INSERT but never SELECT, so generate now or lose it forever" reasoning already used
  for the row's `id`), shown once on the post-submit confirmation screen, and mirrored into the
  host's own confirmation email via `Code.gs` (never the admin notification).
- `api/host/listing-pricing.ts` is the host-side GET/PATCH route, gated by
  `verifyListingAccessCode()` (`api/_lib/adminAuth.ts`, same timing-safe-compare pattern as the admin
  passcode) and rate-limited per IP+listing (failed attempts count too, since a passcode is a
  guessable secret unlike a real login). `api/admin/host-listings.ts` got the equivalent admin-side
  capability folded in via an `action: 'pricing'` field on its existing PATCH (no new file, admin
  already has a real session so no passcode needed there) — this is also why the route stayed under
  Vercel's 12-function cap.
- `api/_lib/stayBooking.ts`'s `resolveNightlyRate()` is what actually prices a night for a host
  listing: an explicit date override first, else the weekend markup on Fri/Sat, else the flat base
  rate — and it's reused by `computeStayBookingBreakdown()` (summed per-night, since a stay can span
  mixed rates now) **and** by `api/price.ts`'s `'calendar'` kind (`computeHostWeeklyCalendar()`) so
  the tenant-facing 7-day preview (`PriceCalendar.tsx`) shows the host's real prices instead of the
  static catalog's fixed day-of-week curve (`api/_lib/pricing.ts`'s `DAY_MULTIPLIERS`, which still
  powers that same preview for static catalog properties only — they have no owning host row).
- Host UI: `/dashboard/pricing` (`src/pages/host/HostPricingPage.tsx`). Admin UI: an expandable
  "Pricing" panel per listing in `/admin/properties`. Both share date-math helpers from
  `src/lib/pricingCalendar.ts` rather than duplicating the resolved-price logic.
- "Smart pricing" is a starter-default toggle (sets a sensible weekend markup the host can still see
  and override), not a live demand-based pricing engine — there's no demand data anywhere in this
  codebase to drive one, and the UI copy says so explicitly rather than overpromising.

### Booking status, cancellation, host/tenant booking views, and reviews

- `bookings.status` (`upcoming` | `cancelled`, added by `supabase/bookings_status.sql`, run once
  like every other Supabase migration here) is the only booking state that's actually stored.
  **"Completed" is never written** — `src/lib/bookingStatus.ts`'s `deriveBookingStatus()` derives
  it from `check_out` being in the past, since that state never needs a write. Every UI that shows
  a booking (`HostBookingsPage`, `MyBookingsPage`, `AdminBookingsPage`) goes through this helper —
  don't recompute the upcoming/completed/cancelled logic inline.
- `api/bookings/mine.ts` is the shared read/cancel endpoint for **both** hosts and tenants,
  dispatched on a `role=host|tenant` query param (mirrors `host_email` vs `tenant_email`) — this
  was folded into one file rather than two to stay under Vercel's 12-function cap (see "API" above).
  `GET` lists a role's own bookings by email; `PATCH` lets a host or tenant cancel their own
  *upcoming* booking (ownership checked by matching the email against that row's own
  host/tenant-email column — same no-real-session trust model as `HostOnlyRoute`, not a hardened
  auth check). Admin cancellation is a separate, real-auth path: `api/admin/bookings.ts`'s `PATCH`
  now also accepts a `status` field alongside `payoutStatus`, gated by `verifyAdminSession()`.
- Host Dashboard's **Bookings** tab (`/dashboard/bookings`, `src/pages/host/HostBookings.tsx`) and
  the tenant-facing **My Bookings** page (`/bookings`, `src/pages/MyBookings.tsx`) both read
  `api/bookings/mine.ts` via the shared `src/hooks/useMyBookings.ts` hook — don't duplicate the
  fetch/cancel logic in either page again.
- **New-booking badge for hosts**: there's still no real push-notification infra, so
  `src/hooks/useNewBookingsCount.ts` compares each booking's `created_at` against a per-host "last
  seen" timestamp kept in `localStorage` (`innbly_host_bookings_last_seen_<email>`), shown as a red
  count badge on the Bookings tab in `HostDashboardLayout.tsx`, cleared when the host actually opens
  that tab. This is in addition to, not a replacement for, the existing email notification
  (`Code.gs`'s `sendBookingEmails()`).
- **Reviews**: `supabase/reviews.sql` (run once) creates a `reviews` table, one row per completed
  booking (`booking_id` is `unique`), with public `SELECT` allowed (needed so ratings show on public
  property pages) but **no anon insert/update/delete policy** — the only way to create a review is
  `api/submit.ts`'s `type: 'review'` branch (`handleReview()`), which uses the service-role key to
  independently verify the booking belongs to that tenant email, isn't cancelled, and `check_out`
  has actually passed, before inserting — never trust a client-supplied "I stayed here." Tenants
  submit from `MyBookingsPage`'s inline review form, only shown once a booking's derived status is
  `completed`. `src/context/PropertiesContext.tsx` fetches all reviews once (public anon read) and
  overlays real rating/reviewCount/reviews onto a property **only when real reviews exist for its
  id** — a property with none keeps its existing values (curated demo content for the static
  catalog, or the honest "new/unrated" defaults from `mapApprovedListing.ts` for host listings).

### Blog (auto-published via n8n)

`/blog` and `/blog/:slug` (`src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`) are backed by a
`blog_posts` Supabase table (`supabase/blog_posts.sql`, run once like every other Supabase file
here) — same read-through-a-public-view pattern as `approved_listings`: the public site reads
`published_blog_posts` with the anon key (`src/lib/blog.ts`), and there is **no anon insert
policy** — every write goes through `api/submit.ts`'s `type: 'blogPost'` branch, gated by a shared
secret (`BLOG_INGEST_SECRET`, checked against a `secret` field in the POST body, not a session
cookie — the caller is an n8n workflow, not a logged-in browser). This was folded into
`api/submit.ts` rather than a new `api/blog.ts` file because the deployment is already at
Vercel's Hobby-plan cap of 12 serverless functions (see "API" above).
- The n8n workflow (`n8n-workflows/innbly-auto-blogging.json`, see that folder's `README.md` for
  setup) is adapted from two reference workflows the site owner already runs for other
  properties (CircleOfLearning, ProRido) — same shape (Google Sheet queue → scheduled trigger →
  Gemini AI Agent writes the article → Pexels cover image), but the publish step is a single HTTP
  Request POST to `/api/submit` instead of a GitHub commit or WordPress REST call, since content
  lives in Supabase here, not a git repo or WordPress. The upsert is keyed on `slug`, so re-running
  the workflow for an already-published row edits that post rather than duplicating it.
- `content` can be Markdown or ready-made HTML — `src/lib/markdown.ts` renders either (HTML is
  passed through untouched if it already starts with a tag, otherwise converted from Markdown by
  a small hand-rolled converter; no markdown library dependency was added for this). Content only
  ever arrives through the `BLOG_INGEST_SECRET`-gated path above, never from a site visitor, which
  is why rendering it with `dangerouslySetInnerHTML` is an accepted trust boundary here — don't
  reuse that pattern for anything user-submitted.
- Blog posts are included in `scripts/generate-sitemap.ts`'s output and get `BlogPosting` +
  `BreadcrumbList` JSON-LD via `useJsonLd` (`src/pages/BlogPost.tsx`), same per-page-schema
  pattern as `DestinationPage`.

### Testing

Playwright specs in `e2e/` are organized by feature area, not by page — `nightly-booking.spec.ts`
and `phase1-features.spec.ts` both touch multiple pages. Tests run against the real dev server and
real (local) API, not mocks. Known gotchas:
- Locally, requests without an `x-forwarded-for` header all collapse into the same rate-limit
  bucket, so a dedicated rate-limit test should set a synthetic `x-forwarded-for` header (see
  `api-security.spec.ts`).
- Route-level code-splitting means a navigation between two lazy routes can very briefly leave
  both trees mounted mid-transition; if a strict-mode "resolved to 2 elements" failure shows up
  right after a `page.goto`/link click, wait for a destination-page-specific element first (see
  the `"Showing: X"` banner wait in `phase1-features.spec.ts`) rather than assuming it's a real bug.
