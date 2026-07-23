# Operations Guide

A human-facing runbook: what's real, what's fake, where data lives, and how to access everything.
(`CLAUDE.md` is the equivalent doc aimed at Claude Code sessions — this one is for you.)

## 1. The most important fact about this site

**There are two completely separate "login" systems that behave very differently:**

| | Tenant/Host sign-in (navbar) | Admin (`/admin`) |
|---|---|---|
| What it checks | Nothing. Any name/email you type is accepted. | A real passcode, checked on the server. |
| Where the session lives | Your browser's `localStorage` | An HMAC-signed cookie set by the server |
| Can you fake it | Yes, trivially (it's not designed to stop you) | No — you need the real `ADMIN_PASSCODE` |
| Purpose | Personalize the UI, tag who submitted what | Gate real data: approving listings, viewing submissions |

This is intentional, not a bug — see `CLAUDE.md`'s "Auth model" section. The tenant/host side has no
passwords, no server session, nothing to hack because there's nothing guarding it. Don't expect it to
behave like real auth.

## 2. How to sign in / sign up (tenant or host)

1. Click **Sign In / Sign Up** in the navbar (top right).
2. Fill in any name + email (they don't need to be real, nothing verifies them) — or use the Google
   button if `VITE_GOOGLE_CLIENT_ID` is configured (see §6).
3. Toggle "List a property instead" if you want a host session, otherwise you get a tenant session.
4. Submit. You're instantly "logged in" — this writes your `{name, email, role}` to
   `localStorage` under the key `innbly_auth_user` and never expires until you log out or clear
   site data.

This also fires a best-effort background call to `/api/signup` so the submission shows up in the
Admin dashboard's "Signups" tab and (if configured) the Google Sheet — but as of this fix, **that
call can fail without blocking your login**. If you see a toast like "you're signed in, but we
couldn't log this signup," you're still logged in; only the record-keeping failed.

**To test as a host without any real credentials:** just pick "host" in the modal with a fake email
like `test-host@example.com`. Clicking "List Your Property" anywhere on the site (navbar, homepage
CTA) will open this modal pre-set to host if you're not already signed in, and will drop you
straight into the listing form once you are.

## 3. "List Your Property" — the actual flow

1. Click **List Your Property** (navbar or homepage CTA). If you're not signed in as a host, this
   opens the sign-in modal pre-toggled to "host" — sign in there first, then you're redirected
   straight to the form.
2. Fill out the multi-step form at `/dashboard/list-property` and submit.
3. This uploads your photos/documents to **Cloudinary** and inserts one row into the
   **Supabase `host_submissions` table** (with the Cloudinary URLs, not the files themselves),
   status `pending`. It also best-effort mirrors the submission to Google Sheets if that's configured.
4. Your submission does **not** go live automatically. An admin has to approve it in `/admin`
   under "Property Approvals."
5. Once approved, it becomes a real, publicly searchable listing (via the `approved_listings`
   Postgres view) and will appear in your **Host Dashboard** (`/dashboard`) under "My Listings,"
   plus in site search results like any other property.

**"My Listings" only tracks submissions made from the same browser** (there's no real per-host
account to query against — see §1). It stores the submitted row's id in
`localStorage` (`innbly_my_listing_ids`) and cross-references it against the approved listings.
If you submit from your phone and check the dashboard from your laptop, it won't show there — this
is a known limitation, not a bug, given there's no real login.

## 4. Admin dashboard — how to actually get in

- URL: `innbly.com/admin`
- You need the value of the `ADMIN_PASSCODE` environment variable. **I cannot see this value** — it's
  a secret you (or whoever set up the Vercel project) configured. To find/change it:
  1. Go to the Vercel dashboard → your project → **Settings → Environment Variables**.
  2. Look for `ADMIN_PASSCODE`. Click the eye icon to reveal it, or edit it to set a new one.
  3. Also present there: `ADMIN_SESSION_SECRET` (used only to sign the session cookie — you never
     type this one in, it's internal) and `SUPABASE_SERVICE_ROLE_KEY` (lets the admin API read/write
     Supabase with full access, bypassing the public row-level security rules).
  4. If you change `ADMIN_PASSCODE`, redeploy for it to take effect.
- Once you have the passcode, go to `/admin` and enter it. You get a signed session cookie
  valid until you click "Log out" (or it's cleared).
- What you can do there: approve/reject host submissions (makes them live listings), view recent
  signups/leads/contact messages/newsletter subscribers, and payments config status.

If `/admin` seems to show dashboard content without prompting for a passcode, that was a real bug
(fixed in this round — see §8) where a crashing or slow backend request left the page showing
dashboard chrome instead of the login form. It never exposed real data (the underlying fetches were
failing), but the page now shows a loading spinner until the auth check actually completes, and
fails to the login form on any error.

## 5. Where every piece of data actually lives

| Data | Where it lives | Who can read it |
|---|---|---|
| Property catalog (built-in demo listings) | `src/data/properties.ts` (a file in the repo — not a database) | Anyone (public site) |
| Approved host listings | Supabase `host_submissions` table, exposed via the `approved_listings` view | Anyone (public site, via anon key) |
| Pending/rejected host submissions (with owner contact info) | Supabase `host_submissions` table directly | Only the admin API, via `SUPABASE_SERVICE_ROLE_KEY` |
| Uploaded listing photos/documents | Cloudinary (public URLs stored in the `host_submissions` row) | Public URLs once uploaded (needed so the site can display them) |
| Signups, leads, contact messages, newsletter subs | Google Sheets, if `SHEETS_WEBAPP_URL` is configured — see §7 | Whoever has access to that Google Sheet, plus the Admin dashboard's summary view |
| Tenant/host "login" session | Your own browser's `localStorage` (`innbly_auth_user`) | Only you, only on that browser |
| Saved properties / recently viewed / compare list / saved searches | Your own browser's `localStorage` | Only you, only on that browser |
| Admin session | An HMAC-signed cookie in your browser | Only you, only on that browser |

There is no traditional application database like MySQL/Mongo for the marketplace itself — Supabase
is used narrowly, just for the host-submission pipeline.

## 6. Google Sign-In setup (not yet configured)

Google Sign-In needs a **Google OAuth Client ID**, which only you can create (it's tied to a Google
Cloud project you own):

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create/select a project.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Authorized JavaScript origins: add `https://innbly.com` (and `http://localhost:5173` for local
   testing).
5. Copy the generated Client ID.
6. In Vercel: **Settings → Environment Variables**, add `VITE_GOOGLE_CLIENT_ID` = that value
   (note the `VITE_` prefix — this one is safe to expose to the browser, Google's client library
   expects it there). Redeploy.

Until this is set, the Google button either doesn't render or fails silently — email sign-in still
works fully regardless.

## 6a. Cloudinary setup (for listing photo/document uploads)

Listing photos and documents upload to Cloudinary rather than Supabase Storage (Supabase's free
tier is only 1GB — easy to blow through with photos; Cloudinary's free tier, ~25GB storage and
bandwidth a month, is built for exactly this). Setup:

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Your **Cloud Name** is shown on the dashboard homepage right after signup.
3. Create an **unsigned upload preset**: Settings (gear icon) → **Upload** tab → **Upload presets**
   → **Add upload preset** → set **Signing Mode** to **Unsigned** → Save. Note the preset name.
   (Unsigned presets are safe to expose in the browser bundle — they can only accept uploads into
   their own configured settings, not read, list, or delete anything, the same trust model as the
   Supabase anon key.)
4. In Vercel: **Settings → Environment Variables**, add:
   - `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` = your preset name
   Redeploy.

Until these are set, submitting the host form fails with "Listing submissions are temporarily
unavailable" at the upload step.

## 7. Why "no mail, no Google Sheets, no data"

Two independent reasons, both worth checking:

1. **`SHEETS_WEBAPP_URL` is a server-only env var** that points at a Google Apps Script web app
   which writes rows into a Google Sheet (and can send email from there). Setting it up is a
   one-time manual step documented in `google-apps-script/README.md` — deploying the included
   `Code.gs` as a web app and pasting its URL into Vercel's env vars. If you haven't done that yet,
   every signup/lead/contact submission silently no-ops on the Sheets side by design (it never
   blocks the user-facing action), which looks exactly like "nothing is happening."
2. Separately, if `/api/*` routes are crashing on Vercel (see §8), *nothing* server-side works,
   including the Sheets forwarding, Supabase submissions, and admin login — this needs your Vercel
   Function/Runtime logs to diagnose further, since I can't see them from here.

Supabase (the host-listing pipeline) is a separate system from Google Sheets and works independently
once its own env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
are set — which you've already done in a previous round.

## 8. Known unresolved issue: `/api/*` may be crashing on Vercel

While investigating the admin-access bug, hitting `/api/admin/stats` and even the old, unrelated
`/api/price` endpoint both returned Vercel's generic `FUNCTION_INVOCATION_FAILED` error — a full
serverless function crash, not a normal error response from our own code. This affects every backend
feature at once: signup, leads, contact, newsletter, host listings, admin login.

I can't see Vercel's build/runtime logs from here, and couldn't reproduce it in the local dev server
(which runs a different, simplified execution path). **To debug this**, open the Vercel dashboard →
your project → **Deployments** → the latest one → **Runtime Logs** (or Functions tab), trigger the
failing request again, and copy the actual error text — paste it back here and it can likely be
fixed quickly once the real error is visible.

## 9. `/enterprise` — is it public, and where do bookings go?

Yes, `/enterprise/*` is intentionally a public demo area (a separate hotel-operator PMS/booking-engine
pitch, unrelated to the tenant marketplace — see `CLAUDE.md`). It's not gated because it's meant to
be shown to prospective enterprise customers as a sales demo. Any "booking" or lead capture inside it
is local-only demo state (numbers/timelines it computes client-side) — it does not submit anywhere,
is not stored in Supabase or Sheets, and nobody receives it. If you want this area gated (e.g. behind
a password) or want its demo bookings to actually notify you, that's a real, separate feature to add —
say the word and it can be built.

## 10. Testing everything without any real credentials

The full site — search, sign-in/up (both roles), listing a property end-to-end, viewing a personal
host dashboard — works completely locally with **zero secrets configured**:

```bash
npm run dev          # starts the Vite client (5173) + local API server (8787)
```

- Sign up/sign in with any fake name+email — works identically to production (§1–2).
- To exercise the host-listing → Supabase flow locally, you do need the same `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` in a local `.env` (gitignored) that production uses — Supabase itself
  isn't mocked locally. Without them, `ListProperty.tsx` shows a clear "temporarily unavailable"
  error instead of crashing.
- To test Admin locally without knowing the real production passcode, set your own
  `ADMIN_PASSCODE` in the local `.env` — any value you pick works for local testing.
- The automated test suite (`npx playwright test`, 32 specs) exercises navigation, search filters,
  auth, the enterprise demo, admin login, and API security/rate-limiting — all against the real
  local dev server, no mocks. Run it any time to sanity-check nothing's broken:
  ```bash
  npx playwright test
  ```

## 11. URL reference

| URL | What it is | Access |
|---|---|---|
| `innbly.com` | Main marketplace site | Public |
| `innbly.com/search` | Search/filter results | Public |
| `innbly.com/dashboard` | Host dashboard (own listings + leads) | Requires a host session (fake auth, §1) |
| `innbly.com/dashboard/list-property` | Submit a new listing | Requires a host session |
| `innbly.com/admin` | Admin approvals + data summary | Requires the real `ADMIN_PASSCODE` |
| `innbly.com/enterprise` | Enterprise PMS demo/pitch | Public, intentionally (§9) |
| `innbly.com/saved` | Tenant's saved properties | Requires a tenant session |
