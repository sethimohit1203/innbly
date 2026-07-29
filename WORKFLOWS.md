# innbly — Site Workflows & Processes

A living handbook of every end-to-end flow on the site: what happens, in what order, and which
file drives each step. **Update this file whenever a flow changes** — it's the one place meant to
stay in sync with how the site actually behaves, independent of the more technical `CLAUDE.md`
(architecture, for Claude Code sessions) and `OPERATIONS.md` (credentials, URLs, access).

---

## 1. Tenant sign-up / sign-in

1. Visitor clicks **Sign In / Sign Up** (navbar) → `src/components/AuthModal.tsx` opens.
2. Enters name + email (no password — see "Auth model" note below), optionally toggles "List a
   property instead" for a host session, or uses the Google button.
3. Submitting logs them in **immediately** (local session), then best-effort logs the signup to
   Google Sheets/Admin in the background — a failure there does not block login.
4. If they picked "host," they're redirected straight to `/dashboard/list-property`.

**Not real authentication.** No password, no server-verified session — this only personalizes the
UI and tags who submitted what. Session lives in the browser's `localStorage`
(`innbly_auth_user`), and is trivially fakeable. Real security is admin auth only (§6).

## 2. Listing a property (host)

1. Signed-in host clicks **List Your Property** → multi-step form at `/dashboard/list-property`
   (`src/pages/ListProperty.tsx`).
2. Submitting uploads photos/documents to **Cloudinary**, then inserts a row into Supabase's
   `host_submissions` table, status `pending`.
3. Best-effort mirrors the submission to Google Sheets (backup + admin/host emails).
4. Host is redirected to their dashboard, where the new listing shows as "Pending Review" (tracked
   by the browser locally in `innbly_my_listing_ids` — no real per-host account to query against).
5. **Nothing is public yet** — an admin has to approve it.

## 3. Admin approval → going live

1. Admin logs into `/admin` (real passcode auth) → **Manage Properties** tab
   (`src/pages/admin/AdminProperties.tsx`) shows every submission with photo thumbnails.
2. Clicking **Approve** flips the Supabase row's `status` to `approved`.
3. The moment that happens, the listing appears in the public `approved_listings` Postgres view,
   which `PropertiesContext` merges into the site's live catalog — it shows up in search, the
   homepage, and gets its own `/property/<id>` page, indistinguishable from the built-in demo
   listings. **No separate "publish" step, no delay.**
4. Rejecting sets `status` to `rejected` (reversible via **Reset**).

## 4. Booking a stay & paying (tenant) — real money

1. On a property page, tenant picks check-in/check-out + guests, clicks **Reserve & Pay**
   (`src/components/BookingModal.tsx`).
2. Server (`api/bookings/create-order.ts`) computes the authoritative price — room subtotal, an 8%
   guest service fee, estimated GST, and the security deposit — and creates a real Razorpay order.
3. Razorpay's checkout widget opens. On successful payment, the server
   (`api/bookings/verify.ts`) **independently re-verifies the payment signature** and **recomputes
   the price from scratch** — it never trusts what the browser reports — then saves the booking to
   Supabase's `bookings` table.
4. Admin, host, and tenant each get a confirmation email (`google-apps-script/Code.gs`).
5. **The host's WhatsApp contact only unlocks after this payment succeeds** — before that, "Reserve
   & Pay" is the only way to reach them through the site. This is deliberate: it keeps innbly as
   the transaction's system of record.

## 5. Paying the host their share (admin) — manual for now

1. Admin opens `/admin/bookings` (`src/pages/admin/AdminBookings.tsx`) — shows every booking, the
   host's payout amount (room subtotal minus their 2% commission), and a payout status.
2. Admin pays the host directly (bank transfer/UPI) outside the site, then clicks **Mark Paid
   Out**.
3. **Why manual:** automatically splitting and transferring a host's share requires Razorpay
   Route — a separate marketplace product needing each host to complete their own KYC as a
   "linked account." That's a business approval process with Razorpay, not something achievable
   with API keys alone. Revisit this flow once Route is approved.

## 5a. Cancelling a booking

1. Either the **host** (`/dashboard/bookings`) or the **tenant** (`/bookings`) can cancel their own
   *upcoming* booking with a Cancel button (confirms first) — `api/bookings/mine.ts`'s `PATCH`,
   matched by email against that booking's own host/tenant column.
2. Admin can also cancel any booking from `/admin/bookings`.
3. Cancelling only flips `bookings.status` to `cancelled` — it does **not** trigger a refund. There
   is no automated refund flow yet; if a paid booking needs money back, that's a manual step outside
   the site (Razorpay dashboard) an admin does today.
4. A booking's displayed status is one of **Upcoming**, **Completed**, or **Cancelled** — only
   "cancelled" is stored; "completed" is inferred from `check_out` being in the past
   (`src/lib/bookingStatus.ts`).

## 5b. Tenant reviewing a stay

1. Once a booking's `check_out` date has passed (and it wasn't cancelled), a **Leave a Review**
   button appears on that booking in `/bookings` (`src/pages/MyBookings.tsx`).
2. Tenant picks a 1–5 star rating and an optional comment, submits — this posts to `/api/submit`
   with `type: 'review'`. The server independently checks the booking belongs to that tenant email
   and the stay actually happened before writing to Supabase's `reviews` table — the browser's claim
   is never trusted on its own.
3. One review per booking (enforced by a unique constraint on `booking_id`) — trying again returns
   "You already reviewed this stay."
4. Real reviews show up on the property's page immediately (`PropertiesContext` overlays them onto
   that property's rating/review list) — no admin approval step, unlike host listings.

## 6. Admin login

1. `/admin` prompts for a passcode (`ADMIN_PASSCODE`, server-only env var) — this is the one part
   of the site with real, verified authentication (HMAC-signed session cookie, 12-hour expiry).
2. Once in, the tabs are: **Dashboard Overview** (stats + Payments config status), **Manage
   Properties** (approvals), **Bookings & Payouts** (§5), **Leads Tracker** (visit requests, if
   any come in), **Messages** (signups/contact/newsletter).

## 7. Host's own dashboard

1. `/dashboard` (Overview), `/dashboard/properties` (their own listings, live + pending),
   `/dashboard/bookings` (their confirmed bookings + payout status, §7a),
   `/dashboard/leads` (incoming visit requests) — four real routes sharing
   `src/components/HostDashboardLayout.tsx`.
2. "My listings" is tracked per-browser (no real host account), cross-referenced against the
   public approved-listings data.

## 7a. Host bookings & new-booking alerts

1. `/dashboard/bookings` (`src/pages/host/HostBookings.tsx`) lists every confirmed booking for that
   host's listings, with payout status and a Cancel action for upcoming ones — reads
   `api/bookings/mine.ts?role=host`.
2. The Bookings tab shows a red count badge for bookings the host hasn't seen yet (compared against
   a per-host "last viewed" timestamp in `localStorage`) — clears the moment they open the tab. This
   is on top of, not instead of, the existing email notification to the host (§9).

## 8. Tenant profile & account features

1. `/profile` — edit name/email/phone, upload a profile photo (via Cloudinary, same pipeline as
   listing photos), quick-links to Saved Properties/Compare/Saved Searches/Recently Viewed.
2. `/invite` — a personal referral link (`?ref=<email>`) with copy/WhatsApp/email sharing. No
   reward system behind it — it's a shareable link only, no fabricated "credits earned" claims.
3. `/saved` — wishlist (heart icon on any property card).
4. `/bookings` — **My Bookings** (`src/pages/MyBookings.tsx`): stay history, upcoming/completed/
   cancelled status, cancel an upcoming booking, leave a review on a completed one (§5b).

## 9. Emails — who gets what, and when

All via `google-apps-script/Code.gs` (edit there, then **manually re-paste and redeploy** in the
Apps Script editor — this repo's copy is not auto-synced to the live script):

| Event | Who's emailed |
|---|---|
| Tenant/host signup | Nobody (just logged to the Signups sheet) |
| Host lists a property | Admin (full submission) + Host (confirmation, "pending review") |
| Contact form submitted | Admin only |
| Booking paid | Admin (full record) + Host (guest contact + payout owed) + Tenant (receipt) |
| Booking cancelled | Nobody yet — status flips silently. Adding a cancellation email is a real gap, not yet built. |
| Review submitted | Nobody — it just becomes visible on the property page immediately. |

## 10. What's still a demo, not real

- **`/enterprise`** — a completely separate hotel-operator PMS/booking-engine sales pitch, public
  on purpose, shares no data with the tenant marketplace. Any "booking" made there is local-only
  fake numbers, submits nowhere, notifies nobody.
- Tenant/host sign-in (§1) — not real auth, see the note there.
- GST shown at checkout (§4) — a display estimate, not filed or remitted anywhere. Confirm the
  real slab/registration requirement with a tax advisor before relying on it.
- Cancellation (§5a) is status-only — no automatic refund, no cancellation email to the other party
  yet. An admin has to notice and handle both manually today.

---

## How to keep this file useful

Whenever a flow above changes — a new step added, a step removed, who gets emailed changes, a
manual process becomes automatic (e.g. Razorpay Route goes live) — update the relevant section
here in the same commit as the code change. If a brand-new flow is added (e.g. reviews, in-app
messaging), add a new numbered section rather than burying it inside an existing one.
