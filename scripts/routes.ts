import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { properties } from '../src/data/properties'
import { DESTINATIONS } from '../src/data/destinations'
import { PROGRAMMATIC_PAGES } from '../src/data/programmaticPages'
import { QUICK_FILTERS } from '../src/data/quickFilters'

export type RouteEntry = { path: string; lastmod?: string }

/** Loads .env into process.env if the keys aren't already set (build/CI
 * environments set these directly; local runs read the .env file). */
export function loadEnv() {
  try {
    const envPath = resolve(import.meta.dirname, '../.env')
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2].trim()
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    }
  } catch (err) {
    // Ignore error if .env doesn't exist
  }
}

/** Normalizes a timestamp to a sitemap-friendly YYYY-MM-DD lastmod value. */
function toLastmod(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10)
}

async function fetchApprovedHostListingsAndProfiles(): Promise<{ properties: RouteEntry[]; hosts: RouteEntry[] }> {
  loadEnv()
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase env vars missing. Skipping dynamic host listings.')
    return { properties: [], hosts: [] }
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/approved_listings?select=id,created_at,owner_name`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })
    if (!res.ok) {
      console.error(`Failed to fetch approved listings from Supabase: ${res.statusText}`)
      return { properties: [], hosts: [] }
    }
    const data = (await res.json()) as { id: string; created_at: string; owner_name: string }[]
    const properties = data.map((item) => ({ path: `/property/host-${item.id}`, lastmod: toLastmod(item.created_at) }))
    const hosts = data.map((item) => ({ path: `/host/${encodeURIComponent(item.owner_name)}`, lastmod: toLastmod(item.created_at) }))
    return { properties, hosts }
  } catch (err) {
    console.error('Error fetching approved listings from Supabase:', err)
    return { properties: [], hosts: [] }
  }
}

async function fetchBlogSlugs(): Promise<RouteEntry[]> {
  loadEnv()
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return []

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/published_blog_posts?select=slug,published_at,updated_at`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })
    if (!res.ok) {
      console.error(`Failed to fetch blog posts from Supabase: ${res.statusText}`)
      return []
    }
    const data = (await res.json()) as { slug: string; published_at: string; updated_at?: string }[]
    return data.map((item) => ({
      path: `/blog/${item.slug}`,
      lastmod: toLastmod(item.updated_at ?? item.published_at),
    }))
  } catch (err) {
    console.error('Error fetching blog posts from Supabase:', err)
    return []
  }
}

export const STATIC_ROUTES = [
  '/',
  '/search',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/compare',
  '/blog',
  '/saved',
  '/bookings',
  '/profile',
  '/invite',
  '/enterprise',
  '/enterprise/search',
  '/enterprise/dashboard',
  '/admin',
  '/admin/properties',
  '/admin/bookings',
  '/admin/leads',
  '/admin/messages',
  '/dashboard',
  '/dashboard/properties',
  '/dashboard/pricing',
  '/dashboard/bookings',
  '/dashboard/leads',
  '/dashboard/messages',
  '/dashboard/appointments',
  '/dashboard/languages',
  '/dashboard/resources',
  '/dashboard/co-host',
  '/dashboard/list-property'
]

/** Every publicly indexable route: static pages, destinations, programmatic
 * destination/type pages, the static demo catalog, plus Supabase-backed
 * host listings and blog posts (empty arrays if Supabase env vars aren't
 * available in the current environment). Shared by generate-sitemap.ts and
 * prerender.ts so both always agree on exactly what's public. */
export async function getAllRouteEntries(): Promise<RouteEntry[]> {
  const staticRoutes: RouteEntry[] = STATIC_ROUTES.map((path) => ({ path }))
  const propertyRoutes: RouteEntry[] = properties.map((p) => ({ path: `/property/${p.id}` }))
  const staticHostRoutes: RouteEntry[] = properties.map((p) => ({ path: `/host/${encodeURIComponent(p.ownerName)}` }))
  const destinationRoutes: RouteEntry[] = DESTINATIONS.map((d) => ({ path: `/${d.slug}` }))
  const programmaticRoutes: RouteEntry[] = PROGRAMMATIC_PAGES.map((c) => ({ path: c.path }))
  // Tier A collections (src/data/quickFilters.ts) are indexable landing
  // pages — see SearchResultsPage's canonical logic and SITE-STRUCTURE.md.
  const collectionRoutes: RouteEntry[] = QUICK_FILTERS.filter((f) => f.tier === 'A').map((f) => ({
    path: `/search?collection=${f.slug}`,
  }))

  const [dynamicData, blogRoutes] = await Promise.all([
    fetchApprovedHostListingsAndProfiles(),
    fetchBlogSlugs(),
  ])

  const allEntries = [
    ...staticRoutes,
    ...destinationRoutes,
    ...programmaticRoutes,
    ...collectionRoutes,
    ...propertyRoutes,
    ...staticHostRoutes,
    ...dynamicData.properties,
    ...dynamicData.hosts,
    ...blogRoutes,
  ]

  const seenPaths = new Set<string>()
  const uniqueEntries: RouteEntry[] = []
  for (const entry of allEntries) {
    if (!seenPaths.has(entry.path)) {
      seenPaths.add(entry.path)
      uniqueEntries.push(entry)
    }
  }

  return uniqueEntries
}

/** Plain path list — used where lastmod doesn't matter (prerendering). */
export async function getAllRoutes(): Promise<string[]> {
  return (await getAllRouteEntries()).map((r) => r.path)
}
