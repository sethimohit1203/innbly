-- Run this once in the Supabase SQL Editor after supabase/bookings.sql.
--
-- Adds a cancellation state on top of payout_status. "Completed" is not
-- stored — it's derived in the UI from check_out being in the past, since
-- that never needs a write. "Cancelled" does need a write (host or admin
-- action), so that's the only extra state this column tracks.
alter table public.bookings
  add column if not exists status text not null default 'upcoming' check (status in ('upcoming', 'cancelled'));
