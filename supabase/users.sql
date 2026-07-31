-- Run this once in the Supabase SQL Editor.
--
-- Real user accounts (replacing the old localStorage-only "auth" described
-- in CLAUDE.md). RLS stays enabled with zero policies granted to
-- anon/authenticated — a password table has no business being browser
-- readable/writable at all, so every read/write goes through api/auth.ts
-- using the service_role key, same deny-by-default pattern already used
-- for public.bookings.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null,
  email text not null unique,
  password_hash text not null,
  phone text,
  avatar_url text,

  role text not null default 'tenant' check (role in ('tenant', 'host')),
  email_verified boolean not null default false
);

alter table public.users enable row level security;
-- Deliberately no policies — see the note above. Deny-by-default is correct here.

create unique index if not exists users_email_idx on public.users (lower(email));
