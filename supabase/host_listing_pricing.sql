-- Run this once in the Supabase SQL Editor AFTER host_submissions.sql and
-- host_submissions_approval.sql.
--
-- Adds host-configurable pricing on top of the flat price_per_night that
-- already existed: a weekend markup, a "smart pricing" starter-default
-- toggle, extra fees, a per-listing access code, and a per-date override
-- table — so a host can manage pricing/calendar without a real account
-- (see CLAUDE.md's auth model: there are no passwords anywhere in this app
-- by product decision, so listing ownership here is a generated secret
-- instead of email-matching or a login).

-- access_code: the per-listing secret used in place of a real account.
-- Generated client-side at submission time (crypto-safe randomness) and
-- inserted as part of the same anon INSERT host_submissions.sql already
-- allows — RLS still only grants INSERT to anon, never SELECT, so this
-- column is exactly as unreadable from the browser afterwards as
-- owner_email already is. Nullable because rows created before this
-- migration have no code yet (their host would need to resubmit, or an
-- admin can backfill one via the service-role key).
--
-- MUST NEVER be added to the approved_listings view below, and must never
-- be echoed back by api/host/listing-pricing.ts's responses.
alter table public.host_submissions
  add column if not exists access_code text,
  add column if not exists weekend_adjustment_pct numeric not null default 0
    check (weekend_adjustment_pct between -0.5 and 2),
  add column if not exists smart_pricing_enabled boolean not null default false,
  add column if not exists cleaning_fee numeric not null default 0 check (cleaning_fee >= 0),
  add column if not exists pet_fee numeric not null default 0 check (pet_fee >= 0),
  add column if not exists extra_guest_fee numeric not null default 0 check (extra_guest_fee >= 0);

-- Per-date price overrides. A separate table rather than a JSON column so
-- the booking/calendar pricing resolvers can index and range-query by date
-- cheaply instead of scanning/parsing a blob for every request.
create table if not exists public.listing_date_prices (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.host_submissions(id) on delete cascade,
  price_date date not null,
  nightly_rate numeric not null check (nightly_rate > 0),
  created_at timestamptz not null default now(),
  unique (listing_id, price_date)
);

alter table public.listing_date_prices enable row level security;
-- Deliberately no policies at all (deny-by-default) — every read/write goes
-- through api/host/listing-pricing.ts or api/admin/host-listings.ts using
-- the service-role key, same trust model already used for public.bookings.

create index if not exists listing_date_prices_listing_id_idx
  on public.listing_date_prices (listing_id);

-- Expose the new NON-secret pricing fields on the public view so the
-- tenant-facing calendar/booking pricing engine can read base-level fields
-- via the anon client exactly as it already reads price_per_night today.
-- access_code is never added here.
--
-- New columns MUST be appended after the existing ones (not interleaved) —
-- `create or replace view` only allows adding columns at the end; Postgres
-- rejects anything that renames/reorders an existing output column (error
-- 42P16), which is what putting them before amenities/photo_urls did.
create or replace view public.approved_listings as
select
  id, created_at,
  owner_name, owner_phone,
  property_title, property_type, description,
  city, neighborhood, address,
  max_guests, price_per_night, security_deposit,
  amenities, photo_urls,
  weekend_adjustment_pct, smart_pricing_enabled,
  cleaning_fee, pet_fee, extra_guest_fee
from public.host_submissions
where status = 'approved';

grant select on public.approved_listings to anon;
alter view public.approved_listings set (security_invoker = false);

-- listing_date_prices is intentionally NOT exposed through any public view.
-- Server-side pricing code (api/_lib/stayBooking.ts, api/price.ts) reads it
-- directly with the service-role key, the same way api/bookings/verify.ts
-- already reads host_submissions.owner_email outside the public view.
