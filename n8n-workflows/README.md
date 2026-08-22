# Auto-blogging n8n workflow

`innbly-auto-blogging.json` is adapted from the two reference workflows the
owner already runs (CircleOfLearning's `Auto Blogging COL` and ProRido's
`Auto Blogging Prorido`) — same shape: a Google Sheet as the content queue,
a scheduled trigger, a Gemini AI Agent that writes the article, a Pexels
image search for a cover photo, then a publish step.

The only thing that changes vs. those two is the publish step. CoL pushes a
Markdown file to GitHub; ProRido posts to a WordPress REST API. Innbly has
neither — content lives in Supabase, fronted by `api/submit.ts`
(`type: 'blogPost'`) per [CLAUDE.md](../CLAUDE.md)'s "API" section (the
Hobby-plan 12-function cap means this couldn't be its own `api/blog.ts`
file, same reasoning as every other consolidated route there). So the final
node here is one `HTTP Request` POST instead of a GitHub/WordPress call.

## Setup

1. Run `supabase/blog_posts.sql` once in the Supabase SQL Editor (same
   one-time-migration pattern as every other `supabase/*.sql` file).
2. Set `BLOG_INGEST_SECRET` in Vercel's environment variables to a long
   random string.
3. Make a Google Sheet with columns: `Title`, `Slug`, `Tags`, `Content
   Generation Prompt` (or `Primary KW` / `Intent` if you want to reuse the
   ProRido-style prompt structure instead), `Status`, `Published URL`. Point
   the "Get row(s) in sheet" node at it, filtering `Status = Pending`.
4. Import `innbly-auto-blogging.json` into n8n, attach your existing Google
   Gemini and Pexels credentials (same ones already used by the CoL/ProRido
   workflows — no new API keys needed), and set the `blogSecret` value in
   the final HTTP Request node's body to the same string as
   `BLOG_INGEST_SECRET`.
5. Activate the workflow. It runs every 8 hours by default (same cadence as
   the CoL workflow) — adjust the Schedule Trigger interval as needed.

## What it writes

Each run POSTs one JSON body to `https://www.innbly.com/api/submit`:

```json
{
  "type": "blogPost",
  "secret": "<BLOG_INGEST_SECRET>",
  "title": "...",
  "slug": "...",
  "description": "...",
  "content": "<markdown or HTML>",
  "coverImage": "<Pexels URL>",
  "tags": ["goa", "villa-rentals"],
  "author": "Innbly Editorial Team",
  "source": "n8n"
}
```

`content` can be Markdown (like the CoL prompt produces) or ready-made HTML
(like the ProRido prompt produces) — `src/lib/markdown.ts` on the site
renders either. The upsert is keyed on `slug`, so re-running the workflow
for a row that already published just updates that post instead of
duplicating it.

The AI Agent's system prompt in this workflow is written for Innbly's own
topic: India travel/destination guides and vacation-rental hosting content,
with internal links to `/search`, `/blog`, and the relevant `/<destination-slug>`
page (see `src/data/destinations.ts` for valid slugs) instead of
CircleOfLearning's `/notes` links or ProRido's fleet-pricing tables — the
mandatory-internal-link and mandatory-FAQ structure is otherwise carried
over unchanged, since it's what makes those two workflows' output rank.
