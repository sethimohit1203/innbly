-- Run this once in the Supabase SQL Editor.
--
-- Additive fields for the multi-step host wizard's new Structure/Privacy
-- type/Location-map steps. All nullable/optional — existing rows and the
-- old single-page form flow (if ever reverted to) both remain valid without
-- backfilling anything.
--
-- structure_type/privacy_type are metadata only (Airbnb-style "what kind of
-- place is it" / "what will guests have" descriptors) — deliberately NOT
-- reused for the existing property_type column, which still drives
-- site-wide category filters (Villas/Hotels/...) and must keep its current
-- values untouched.
alter table public.host_submissions
  add column if not exists structure_type text,
  add column if not exists privacy_type text check (privacy_type in ('entire', 'room', 'shared') or privacy_type is null),
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;

-- Appended at the end (not interleaved with existing columns) — see
-- host_listing_pricing.sql's comment on why create-or-replace-view requires
-- this ordering.
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
  structure_type, privacy_type, latitude, longitude
from public.host_submissions
where status = 'approved';

grant select on public.approved_listings to anon;
alter view public.approved_listings set (security_invoker = false);
