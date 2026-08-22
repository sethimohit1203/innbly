import { supabase } from './supabase'

export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  content: string
  coverImage: string
  tags: string[]
  author: string
  publishedAt: string
}

interface BlogPostRow {
  id: string
  slug: string
  title: string
  description: string
  content: string
  cover_image: string
  tags: string[]
  author: string
  published_at: string
}

function mapRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    coverImage: row.cover_image,
    tags: row.tags ?? [],
    author: row.author,
    publishedAt: row.published_at,
  }
}

/** Reads from the `published_blog_posts` view (public SELECT, anon key) —
 * same "read through a view, write only via service role" pattern as
 * approved_listings. Returns [] rather than throwing if Supabase isn't
 * configured, so the blog section degrades to "no posts yet" instead of
 * crashing the page — same nullable-client guard as everywhere else that
 * imports src/lib/supabase.ts. */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('published_blog_posts').select('*')
  if (error || !data) return []
  return (data as BlogPostRow[]).map(mapRow)
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('published_blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) return null
  return mapRow(data as BlogPostRow)
}
