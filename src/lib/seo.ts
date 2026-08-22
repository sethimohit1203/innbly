export const SITE_URL = 'https://www.innbly.com'
export const SITE_NAME = 'innbly'
export const SITE_LOGO = `${SITE_URL}/brand/innbly-icon.jpg`
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/innbly',
  facebook: 'https://www.facebook.com/share/1disYe1r9U/',
  youtube: 'https://youtube.com/@innbly',
}
export const SAME_AS = [SOCIAL_LINKS.instagram, SOCIAL_LINKS.facebook, SOCIAL_LINKS.youtube]

/** Keeps the JS-set <link rel="canonical"> in sync with the current route.
 * Static per-request canonicals would need SSR/prerendering (not present in
 * this SPA) — Googlebot executes JS and honors this, but it's not a
 * substitute for a server-rendered canonical if that's ever needed for
 * non-Google crawlers. */
export function setCanonical(path: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `${SITE_URL}${path}`)
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function webPageSchema(opts: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  }
}
