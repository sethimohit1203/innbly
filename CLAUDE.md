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

Playwright's `webServer` config (`playwright.config.ts`) runs `npm run dev` automatically, so
`npx playwright test` works standalone — no need to start the dev server first. It reuses an
already-running server outside CI.

There is no separate lint script; `tsc -b` (client) and `tsc --noEmit -p api/tsconfig.json` (API)
are the only static checks. Run both before committing.

## Architecture

This is two apps in one repo: a Vite/React SPA (`src/`) and a set of Vercel serverless functions
(`api/`), bridged locally by `scripts/dev-api-server.ts`.

### Client (`src/`)

- Vite + React 18 + TypeScript + Tailwind, React Router for client-side routing (all routes
  declared in `App.tsx`). No server-side rendering.
- `src/data/properties.ts` is the single source of truth for listing data (typed by
  `src/types.ts`). There is no database — this file *is* the catalog. Adding a field to a listing
  means updating `Property` in `types.ts` and every entry in `properties.ts`.
- `src/data/quickFilters.ts` defines named filter predicates (`slug` + `(p: Property) => boolean`)
  shared by hero quick-chips, the category nav, the collections grid, and the lifestyle explorer.
  They all link to `/search?collection=<slug>`, and `SearchResultsPage` looks up and applies the
  predicate. Adding a new "collection" tile anywhere on the site means adding one entry here — do
  not hand-roll a new query-param scheme per component.
- State that needs to persist across a session (saved properties, recently viewed, compare list,
  saved searches, leads, auth, toasts, the visit-scheduling modal) lives in `src/context/*`,
  composed once in `AppProviders.tsx`. Each context follows the same pattern: React state
  initialized from `localStorage`, written back via `useEffect`.
- `src/hooks/useServerPrice.ts` is the only sanctioned way to show a price on screen. It debounces
  a POST to `/api/price` and renders whatever the server returns — **no page computes a rupee
  amount client-side**. See "Pricing is server-authoritative" below.
- `/enterprise/*` (`src/pages/enterprise/`, `src/components/enterprise/`) is a separate demo
  product area — a hotel-operator PMS/booking-engine pitch — that intentionally does not share
  data or components with the tenant-facing marketplace. Don't wire the two together.
- `HostOnlyRoute` gates `/dashboard` and `/dashboard/list-property` client-side by
  `useAuth().user?.role === 'host'`. This is a UX guard, not real security — there is no backend
  session tied to it (see below).

### Auth model (important: this is not real authentication)

Login/signup (`AuthContext`, `AuthModal`) only captures name + email + role to personalize the UI
and tag leads — there are no passwords and no server-verified sessions for tenant/host accounts.
Don't build features that assume `user` is a trustworthy identity boundary.

The **admin dashboard** (`/admin`, `api/admin/*`) is separate and is real auth: a passcode checked
server-side (`api/_lib/adminAuth.ts`) against `ADMIN_PASSCODE`, with an HMAC-signed session cookie
(`ADMIN_SESSION_SECRET`). Both are Vercel env vars, not client-exposed.

### API (`api/`) and why it exists

Every write (leads, signups, newsletter, contact) goes through `api/*.ts` instead of hitting an
external Google Apps Script URL directly from the browser. This is deliberate: `SHEETS_WEBAPP_URL`
and the admin secrets are server-only env vars (no `VITE_` prefix) so they never end up in the
client bundle — anything `VITE_`-prefixed is publicly readable in the built JS. See
`google-apps-script/README.md` for the Sheets backend setup this all forwards to.

- `api/_lib/pricing.ts` holds every pricing formula (nightly estimator, booking totals, ROI
  calculator, the 7-day price calendar). `api/price.ts` dispatches on a `kind` field to the right
  function. **All property prices in `src/data/properties.ts` are nightly rates**, not monthly —
  don't reintroduce a `/30` or `×30` conversion.
- `api/_lib/rateLimit.ts` is an in-memory per-warm-instance limiter (leads, signup, newsletter,
  contact, admin login all use it). It's best-effort, not a hard guarantee across serverless
  instances — acceptable for this project's scale, called out in code comments if you need to
  upgrade it later (Upstash Redis is the natural next step).
- `api/tsconfig.json` is a **separate** TypeScript project from the root one. `tsc -b` (used by
  `npm run build`) does not typecheck `api/` — always run `npm run typecheck:api` too.
- `scripts/dev-api-server.ts` is a minimal Node `http` server that mounts the same `api/*.ts`
  handler files locally (via a hand-rolled `ApiRequest`/`ApiResponse` shim in `api/_lib/http.ts`)
  so `npm run dev` and Playwright behave the same locally as they will on Vercel. If you add a new
  `api/*.ts` file, you must also register it in the `ROUTES` map in this file or it 404s locally.
- `vercel.json` rewrites everything except `/api/*` to `/index.html` — required for client-side
  routing to work on refresh/direct-navigation in production. If deep links start 404ing on
  Vercel, check this file first.

### Testing

Playwright specs in `e2e/` are organized by feature area, not by page — `nightly-booking.spec.ts`
and `phase1-features.spec.ts` both touch multiple pages. Tests run against the real dev server and
real (local) API, not mocks. Known gotcha: locally, requests without an `x-forwarded-for` header
all collapse into the same rate-limit bucket, so a dedicated rate-limit test should set a synthetic
`x-forwarded-for` header to avoid colliding with other tests' traffic (see
`api-security.spec.ts`).
