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

### Auth model (important: this is not real authentication)

Login/signup (`AuthContext`, `AuthModal`) only captures name + email + role to personalize the UI
and tag leads — there are no passwords and no server-verified sessions for tenant/host accounts.
Don't build features that assume `user` is a trustworthy identity boundary.

The **admin dashboard** (`/admin`, `api/admin/*`) is separate and is real auth: a passcode checked
server-side (`api/_lib/adminAuth.ts`) against `ADMIN_PASSCODE`, with an HMAC-signed session cookie
(`ADMIN_SESSION_SECRET`). Both are Vercel env vars, not client-exposed.

### API (`api/`) — Google Sheets side

Every write (leads, signups, newsletter, contact, host-listing backup) goes through `api/*.ts`
instead of hitting an external Google Apps Script URL directly from the browser. This is
deliberate: `SHEETS_WEBAPP_URL` and the admin secrets are server-only env vars (no `VITE_` prefix)
so they never end up in the client bundle. See `google-apps-script/README.md` for the Sheets
backend setup this all forwards to (`google-apps-script/Code.gs` is the actual Apps Script source —
edit it there, then re-paste into the Apps Script editor and redeploy; this repo copy is not
auto-synced).

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
  host pays **2%** of the room subtotal, guest pays an **8%** service fee, plus an estimated GST
  (12%/18% two-tier slab on the nightly rate — **this is a display estimate only**; confirm the
  actual applicable slab and any GST-registration requirement with a tax advisor before relying on
  it for compliance, nothing here files or remits GST). All of this is computed in
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
