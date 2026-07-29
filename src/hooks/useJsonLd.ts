import { useEffect } from 'react'

/** Injects one or more JSON-LD <script type="application/ld+json"> tags into
 * <head>, keyed by `id` so repeated calls (e.g. on route change) replace
 * rather than stack. Removes the tag on unmount.
 *
 * Note: this runs client-side (useEffect), same limitation as usePageMeta —
 * Googlebot executes JS and reads this fine, but non-JS scrapers (social
 * link-preview bots) will not see it. Site-wide Organization/WebSite/
 * SearchAction schema is instead hardcoded as static JSON-LD in index.html
 * for that reason — this hook is for page-specific schema (WebPage,
 * BreadcrumbList, FAQPage, LodgingBusiness, etc.) where Google's rendering
 * is the primary audience. */
export function useJsonLd(id: string, data: unknown | unknown[] | null | undefined) {
  useEffect(() => {
    if (!data) return
    let script = document.getElementById(id) as HTMLScriptElement | null
    const created = !script
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)

    return () => {
      if (created) script?.remove()
    }
  }, [id, JSON.stringify(data)])
}
