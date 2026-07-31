-- Run this once in the Supabase SQL Editor.
--
-- Additive fields for the Host Dashboard's Availability and Cancellations
-- panels (matching Airbnb's calendar sidebar). Descriptive host settings —
-- min/max nights are shown on the public listing but not yet enforced by
-- the booking API (api/_lib/stayBooking.ts doesn't check them), same as
-- the static catalog's existing minStayNights field. cancellation_policy is
-- likewise stored per listing but the actual cancel flow
-- (api/bookings/mine.ts) still applies one site-wide policy — wiring
-- per-listing enforcement is a follow-up, not done here, so this is
-- flagged rather than silently implied as functional.
alter table public.host_submissions
  add column if not exists min_nights integer not null default 1 check (min_nights >= 1),
  add column if not exists max_nights integer not null default 365 check (max_nights >= min_nights),
  add column if not exists cancellation_policy text not null default 'flexible' check (cancellation_policy in ('flexible', 'firm')),
  add column if not exists non_refundable_discount_enabled boolean not null default false;

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
  safety_camera, safety_noise_monitor, safety_weapons,
  min_nights, max_nights, cancellation_policy, non_refundable_discount_enabled
from public.host_submissions
where status = 'approved';

grant select on public.approved_listings to anon;
alter view public.approved_listings set (security_invoker = false);
