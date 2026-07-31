-- Run this once in the Supabase SQL Editor.
--
-- Additive fields for the host wizard's Floor plan / Booking settings /
-- Discounts / Safety details steps (matching Airbnb's own listing flow).
-- All nullable/defaulted — existing rows are unaffected.
--
-- Discounts and safety flags are booleans only (Airbnb's fixed default
-- percentages — 20% new-listing, 1% last-minute, 10% weekly, 15% monthly —
-- are not host-editable here, matching what the screenshots show); nothing
-- in the booking/pricing engine reads these yet, they're listing metadata
-- only. instant_book is likewise not yet wired into the booking flow (every
-- booking already goes through Razorpay checkout immediately) — it's
-- captured for parity/future use, not a functional gate today.
alter table public.host_submissions
  add column if not exists bedrooms integer,
  add column if not exists beds integer,
  add column if not exists bathrooms integer,
  add column if not exists instant_book boolean not null default false,
  add column if not exists discount_new_listing boolean not null default false,
  add column if not exists discount_last_minute boolean not null default false,
  add column if not exists discount_weekly boolean not null default false,
  add column if not exists discount_monthly boolean not null default false,
  add column if not exists safety_camera boolean not null default false,
  add column if not exists safety_noise_monitor boolean not null default false,
  add column if not exists safety_weapons boolean not null default false;

-- Appended at the end, per the column-order lesson in host_listing_pricing.sql.
create or replace view public.approved_listings as
select
  id, created_at,
  owner_name, owner_phone,
  property_title, property_type, description,
  city, neighborhood, address,
  max_guests, price_per_night, security_deposit,
  amenities, photo_urls,
  weekend_adjustment_pct, smart_pricing_enabled,
  cleaning_fee, pet_fee, extra_guest_fee,
  structure_type, privacy_type, latitude, longitude,
  bedrooms, beds, bathrooms, instant_book,
  discount_new_listing, discount_last_minute, discount_weekly, discount_monthly,
  safety_camera, safety_noise_monitor, safety_weapons
from public.host_submissions
where status = 'approved';

grant select on public.approved_listings to anon;
alter view public.approved_listings set (security_invoker = false);
