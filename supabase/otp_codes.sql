-- Run this once in the Supabase SQL Editor.
--
-- Email verification codes for signup. Same deny-by-default RLS as
-- public.users — only api/auth.ts (service_role key) ever reads/writes
-- this table. Codes are single-use: verify-otp deletes the row on success,
-- so this table stays small (only pending/expired codes accumulate, and
-- expired ones can be pruned periodically if desired — not required to
-- function correctly since expiry is checked on every verify).

create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  email text not null,
  code_hash text not null,
  purpose text not null check (purpose in ('signup', 'login')),
  expires_at timestamptz not null,
  attempts integer not null default 0
);

alter table public.otp_codes enable row level security;
-- Deliberately no policies — see the note above. Deny-by-default is correct here.

create index if not exists otp_codes_email_idx on public.otp_codes (lower(email));
