-- Run this once in the Supabase SQL Editor.
--
-- One review per completed booking. Unlike host_submissions, there is no
-- anon insert policy — a review is only ever written by api/submit.ts
-- (type: 'review'), which uses the service-role key after checking the
-- booking exists, belongs to the reviewing tenant, and its check_out date
-- has already passed. RLS still allows public SELECT because ratings need
-- to be readable on public property pages (same trust model as the
-- approved_listings view).
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  booking_id uuid not null references public.bookings(id) unique,
  property_id text not null,

  tenant_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default ''
);

alter table public.reviews enable row level security;

create policy "Public can read reviews" on public.reviews
  for select using (true);
-- Deliberately no insert/update/delete policy for anon — writes only
-- happen server-side via the service-role key in api/submit.ts.
