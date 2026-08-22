import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { preview, type PreviewServer } from 'vite'
import { chromium } from '@playwright/test'
import { getAllRoutes } from './routes'

const DIST_DIR = resolve(import.meta.dirname, '../dist')

// Routes that are meaningfully identical for every visitor/crawler (session-
// gated dashboards, forms) don't need a static snapshot — they're already
// correctly kept out of the sitemap/robots.txt, and prerendering them would
// just bake in the logged-out empty state.
const SKIP_PREFIXES = ['/dashboard', '/admin', '/saved', '/bookings', '/profile', '/invite']

async function snapshotRoute(
  browser: import('@playwright/test').Browser,
  baseUrl: string,
  route: string,
): Promise<void> {
  const page = await browser.newPage()
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 30_000 })
    // Give React Router/lazy chunks + any data-fetching effects a moment to
    // settle beyond the network-idle signal (e.g. state updates after a
    // resolved fetch that don't trigger new network activity).
    await page.waitForTimeout(300)

    const html = await page.content()

    const outPath =
      route === '/'
        ? resolve(DIST_DIR, 'index.html')
        : resolve(DIST_DIR, `.${route}`, 'index.html')

    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html)
    console.log(`  ✓ ${route}`)
  } catch (err) {
    console.error(`  ✗ ${route}: ${(err as Error).message}`)
  } finally {
    await page.close()
  }
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error('dist/ not found — run `vite build` before prerendering.')
    process.exit(1)
  }

  // Query-string routes (e.g. Tier A /search?collection=<slug> landing
  // pages, see quickFilters.ts) can't be prerendered to a distinct static
  // file — Vercel's static/rewrite routing matches on pathname only, so
  // every query variant of a path resolves to the same file regardless.
  // They stay in the sitemap and get correct canonical/title client-side
  // for JS-executing crawlers (Googlebot); only the byte-identical-raw-HTML
  // problem specifically requires per-path prerendering, which doesn't
  // apply here.
  const allRoutes = (await getAllRoutes()).filter(
    (route) =>
      !route.includes('?') &&
      !SKIP_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`)),
  )

  console.log(`Prerendering ${allRoutes.length} routes...`)

  let server: PreviewServer | undefined
  let browser: import('@playwright/test').Browser | undefined
  try {
    server = await preview({ preview: { port: 4183, strictPort: false }, build: { outDir: DIST_DIR } })
    const address = server.resolvedUrls?.local[0]
    if (!address) throw new Error('Could not resolve preview server address')
    const baseUrl = address.replace(/\/$/, '')

    // Vercel's build image doesn't ship Playwright's Chromium binaries (and
    // has no apt-get access to install the ones `playwright install` would
    // need), so this throws there every time — deliberately caught rather
    // than left to crash `npm run build`. Prerendering is a nice-to-have for
    // non-JS-executing crawlers; failing the entire deploy over it (which
    // happened before this guard was added, silently pinning production to
    // the last successful build) is far worse than shipping without it.
    try {
      browser = await chromium.launch()
    } catch (err) {
      console.warn(`Skipping prerendering — Chromium is not available in this environment: ${(err as Error).message}`)
      return
    }

    // Small concurrency window — enough to not take forever on ~35+ routes,
    // gentle enough not to overwhelm the local preview server.
    const CONCURRENCY = 4
    for (let i = 0; i < allRoutes.length; i += CONCURRENCY) {
      const batch = allRoutes.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map((route) => snapshotRoute(browser!, baseUrl, route)))
    }

    console.log('Prerendering complete.')
  } finally {
    await browser?.close()
    server?.httpServer.close()
  }
}

main().catch((err) => {
  console.error('Prerendering failed unexpectedly (non-fatal, build continues):', err)
})
