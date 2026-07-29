import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { properties } from '../src/data/properties'
import { DESTINATIONS } from '../src/data/destinations'
import { PROGRAMMATIC_PAGES } from '../src/data/programmaticPages'

/** Generates public/sitemap.xml from the site's known static + data-driven
 * routes. Run automatically before every build (see "prebuild" in
 * package.json). Property/destination/programmatic pages are all sourced
 * from the same in-repo data files the app itself renders from, so this
 * never drifts out of sync with what's actually live.
 *
 * This does NOT cover Supabase-backed approved host listings (dynamic,
 * only known at runtime) — see the note at the bottom of this file for how
 * to extend it once that matters for SEO at scale. */

const SITE_URL = 'https://innbly.com'

const staticRoutes = ['/', '/search', '/contact', '/privacy-policy', '/terms', '/compare']

const propertyRoutes = properties.map((p) => `/property/${p.id}`)
const destinationRoutes = DESTINATIONS.map((d) => `/${d.slug}`)
const programmaticRoutes = PROGRAMMATIC_PAGES.map((c) => c.path)

const allRoutes = [...staticRoutes, ...destinationRoutes, ...programmaticRoutes, ...propertyRoutes]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve(import.meta.dirname, '../public/sitemap.xml'), xml)
console.log(`sitemap.xml generated with ${allRoutes.length} URLs`)

// TODO once host-listing volume matters for SEO: Supabase's approved_listings
// rows aren't known at build time. Either (a) fetch them here at build time
// with the anon key (same public read the client already does), or (b) move
// sitemap generation to a serverless function (api/sitemap.ts) that queries
// Supabase per-request instead of a static file. Not done here to avoid
// adding a 10th top-level api/*.ts file against the Hobby-plan 12-function
// cap for something that isn't blocking today.
