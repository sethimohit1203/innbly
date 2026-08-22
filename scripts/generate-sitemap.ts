import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getAllRouteEntries } from './routes'

const SITE_URL = 'https://www.innbly.com'

async function main() {
  const allRoutes = await getAllRouteEntries()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    ({ path, lastmod }) => `  <url>
    <loc>${SITE_URL}${path}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>
`

  writeFileSync(resolve(import.meta.dirname, '../public/sitemap.xml'), xml)
  console.log(`sitemap.xml generated with ${allRoutes.length} URLs`)
}

main().catch((err) => {
  console.error('Failed to generate sitemap:', err)
  process.exit(1)
})
