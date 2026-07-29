import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { setCanonical } from '../lib/seo'

const SITE_NAME = 'innbly'

export function usePageMeta(title: string, description?: string) {
  const location = useLocation()

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const prevTitle = document.title
    document.title = fullTitle

    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const prevDescription = metaDescription?.getAttribute('content') ?? ''

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }

    // Keep Open Graph/Twitter title+description roughly in sync too — real
    // per-route OG only matters to crawlers that execute JS (Googlebot does;
    // social link-preview bots generally don't, see index.html's note).
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    const prevOgTitle = ogTitle?.getAttribute('content') ?? ''
    if (ogTitle) ogTitle.setAttribute('content', fullTitle)

    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    const prevOgDescription = ogDescription?.getAttribute('content') ?? ''
    if (description && ogDescription) ogDescription.setAttribute('content', description)

    setCanonical(location.pathname)

    return () => {
      document.title = prevTitle
      if (description && metaDescription) {
        metaDescription.setAttribute('content', prevDescription)
      }
      if (ogTitle) ogTitle.setAttribute('content', prevOgTitle)
      if (description && ogDescription) ogDescription.setAttribute('content', prevOgDescription)
    }
  }, [title, description, location.pathname])
}
