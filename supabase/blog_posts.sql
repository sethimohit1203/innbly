-- Run this once in the Supabase SQL Editor (same one-time-migration pattern
-- as every other file in this folder — there is no migration runner).
--
-- Backs the auto-blogging pipeline: n8n (adapted from the CircleOfLearning
-- and ProRido workflows this repo's owner already runs) POSTs finished
-- articles to api/submit.ts (type: 'blogPost'), which uses the service-role
-- key to upsert here — never an anon insert, same trust model as reviews.
-- The public site reads through the `published_blog_posts` view below using
-- the anon key, same pattern as `approved_listings`.
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  slug text not null unique,
  title text not null,
  description text not null default '',
  -- Markdown or HTML — src/lib/markdown.ts renders either. n8n's CoL flow
  -- produces Markdown, its ProRido flow produces inline-styled HTML; both
  -- are accepted so the same ingestion path works for content sourced from
  -- either workflow style.
  content text not null,
  cover_image text not null default '',
  tags text[] not null default '{}',
  author text not null default 'Innbly Editorial Team',
  -- Which n8n pipeline produced this post — purely informational, shown
  -- nowhere on the public site, useful for debugging ingestion issues.
  source text not null default 'manual',
  published boolean not null default true,
  published_at timestamptz not null default now()
);

create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc) where published = true;

alter table public.blog_posts enable row level security;
-- No anon insert/update/delete policy — every write goes through
-- api/submit.ts's service-role client, gated behind BLOG_INGEST_SECRET.
create policy "Public can read blog_posts" on public.blog_posts
  for select using (true);

-- Public-facing view — excludes nothing sensitive today, but keeps the same
-- "read through a view, never the raw table" shape as approved_listings so
-- an admin-only column can be added later without a client-facing change.
create or replace view public.published_blog_posts as
  select id, slug, title, description, content, cover_image, tags, author, published_at, updated_at
  from public.blog_posts
  where published = true
  order by published_at desc;
