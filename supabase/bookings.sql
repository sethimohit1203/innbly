-- Run this once in your Supabase project's SQL Editor
-- (https://supabase.com/dashboard/project/_/sql/new) before the real
-- booking/payment flow (PropertyDetail's "Reserve & Pay") will work.
--
-- Unlike host_submissions, there is NO anon insert policy here at all —
-- a booking is only ever written after api/bookings/verify.ts has
-- independently verified the Razorpay payment signature server-side (never
-- trust a client-reported "payment succeeded"), using the service_role key.
-- RLS stays enabled with zero policies granted to anon/authenticated, so
-- the table is completely unreadable/unwritable from the browser — only
-- the service_role key (server-only) can touch it, exactly like
-- api/_lib/supabaseAdmin.ts already does for host_submissions approvals.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  property_id text not null,
  property_title text not null,
  host_name text,
  host_email text,
  host_phone text,

  tenant_name text not null,
  tenant_email text not null,
  tenant_phone text not null,

  check_in date not null,
  check_out date not null,
  nights integer not null,
  guests integer not null,

  nightly_rate numeric not null,
  room_subtotal numeric not null,
  guest_service_fee numeric not null,
  gst_amount numeric not null,
  security_deposit numeric not null default 0,
  guest_total numeric not null,
  host_commission numeric not null,
  host_payout_amount numeric not null,

  razorpay_order_id text not null,
  razorpay_payment_id text not null,

  payout_status text not null default 'unpaid' check (payout_status in ('unpaid', 'paid'))
);

alter table public.bookings enable row level security;
-- Deliberately no policies — see the note above. Deny-by-default is correct here.
