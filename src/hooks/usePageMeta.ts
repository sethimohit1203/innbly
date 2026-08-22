import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { setCanonical } from '../lib/seo'

const SITE_NAME = 'innbly'

export function usePageMeta(title: string, description?: string, imageUrl?: string, canonicalPath?: string) {
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

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    const prevOgTitle = ogTitle?.getAttribute('content') ?? ''
    if (ogTitle) ogTitle.setAttribute('content', fullTitle)

    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    const prevOgDescription = ogDescription?.getAttribute('content') ?? ''
    if (description && ogDescription) ogDescription.setAttribute('content', description)

    let ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    const prevOgImage = ogImage?.getAttribute('content') ?? ''
    if (imageUrl) {
      if (!ogImage) {
        ogImage = document.createElement('meta')
        ogImage.setAttribute('property', 'og:image')
        document.head.appendChild(ogImage)
      }
      ogImage.setAttribute('content', imageUrl)
    }

    setCanonical(canonicalPath ?? location.pathname)

    return () => {
      document.title = prevTitle
      if (description && metaDescription) {
        metaDescription.setAttribute('content', prevDescription)
      }
      if (ogTitle) ogTitle.setAttribute('content', prevOgTitle)
      if (description && ogDescription) ogDescription.setAttribute('content', prevOgDescription)
      if (imageUrl && ogImage) ogImage.setAttribute('content', prevOgImage)
    }
  }, [title, description, imageUrl, canonicalPath, location.pathname])
}
