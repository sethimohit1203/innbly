import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { properties } from '../src/data/properties'
import { DESTINATIONS } from '../src/data/destinations'
import { PROGRAMMATIC_PAGES } from '../src/data/programmaticPages'

const SITE_URL = 'https://innbly.com'

// Load .env manually if not in environment
function loadEnv() {
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

async function fetchApprovedHostListings(): Promise<string[]> {
  loadEnv()
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase env vars missing. Skipping dynamic host listings in sitemap.')
    return []
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/approved_listings?select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    if (!res.ok) {
      console.error(`Failed to fetch approved listings from Supabase: ${res.statusText}`)
      return []
    }
    const data = await res.json() as { id: string }[]
    return data.map((item) => `/property/host-${item.id}`)
  } catch (err) {
    console.error('Error fetching approved listings from Supabase:', err)
    return []
  }
}

async function main() {
  const staticRoutes = ['/', '/search', '/contact', '/privacy-policy', '/terms', '/compare']

  const propertyRoutes = properties.map((p) => `/property/${p.id}`)
  const destinationRoutes = DESTINATIONS.map((d) => `/${d.slug}`)
  const programmaticRoutes = PROGRAMMATIC_PAGES.map((c) => c.path)

  const hostApprovedRoutes = await fetchApprovedHostListings()

  const allRoutes = [
    ...staticRoutes,
    ...destinationRoutes,
    ...programmaticRoutes,
    ...propertyRoutes,
    ...hostApprovedRoutes,
  ]

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
  console.log(`sitemap.xml generated with ${allRoutes.length} URLs (${hostApprovedRoutes.length} host-approved listings)`)
}

main().catch(err => {
  console.error('Failed to generate sitemap:', err)
  process.exit(1)
})

