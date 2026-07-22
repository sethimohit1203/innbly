-- Run this once in the Supabase SQL Editor AFTER host_submissions.sql.
-- Adds the "approve a submission -> it goes live as a real listing" loop:
-- admin approve/reject happens server-side only (via the service_role key,
-- api/admin/host-listings.ts), and this adds a public read-only view so the
-- site's Search/Home pages can show approved listings to every visitor.
--
-- Owner email/phone stay out of the public view — owner_phone is still
-- reachable through the same view because the site already shows a WhatsApp
-- chat link built from it on every property page (same as the static
-- catalog), but owner_email is not shown anywhere and is left out.

create or replace view public.approved_listings as
select
  id, created_at,
  owner_name, owner_phone,
  property_title, property_type, description,
  city, neighborhood, address,
  max_guests, price_per_night, security_deposit,
  amenities, photo_urls
from public.host_submissions
where status = 'approved';

grant select on public.approved_listings to anon;

-- RLS on the base table stays insert-only for anon (from host_submissions.sql).
-- The view above is what actually exposes approved rows publicly; the
-- underlying table itself is still unreadable directly by anon.
alter view public.approved_listings set (security_invoker = false);
