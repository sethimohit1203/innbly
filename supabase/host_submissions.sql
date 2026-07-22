-- Run this once in your Supabase project's SQL Editor
-- (https://supabase.com/dashboard/project/_/sql/new) before the host
-- registration form (List Your Property) will work.
--
-- This is intentionally write-only from the browser: the anon key can
-- INSERT a submission but cannot SELECT/UPDATE/DELETE rows. Review and
-- manage submissions from the Supabase Table Editor (or build an internal
-- tool later using the service_role key server-side) — never the service
-- role key in client code.

create table if not exists public.host_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending',

  owner_name text not null,
  owner_email text not null,
  owner_phone text not null,

  property_title text not null,
  property_type text not null,
  description text not null,

  city text not null,
  neighborhood text not null,
  address text not null,

  max_guests integer not null,
  price_per_night numeric not null,
  security_deposit numeric not null default 0,

  amenities text[] not null default '{}',
  photo_urls text[] not null default '{}',
  document_urls text[] not null default '{}'
);

alter table public.host_submissions enable row level security;

drop policy if exists "Anyone can submit a listing" on public.host_submissions;
create policy "Anyone can submit a listing"
  on public.host_submissions
  for insert
  to anon
  with check (true);

-- Storage bucket for listing photos + verification documents uploaded
-- during the host form. Public read so approved photos can be shown on
-- the site later; anon can only upload (insert), not list/delete others'
-- files.
insert into storage.buckets (id, name, public)
values ('host-uploads', 'host-uploads', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload host files" on storage.objects;
create policy "Anyone can upload host files"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'host-uploads');

drop policy if exists "Public can view host files" on storage.objects;
create policy "Public can view host files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'host-uploads');
