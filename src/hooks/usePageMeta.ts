import { useEffect } from 'react'

const SITE_NAME = 'innbly'

export function usePageMeta(title: string, description?: string) {
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

    return () => {
      document.title = prevTitle
      if (description && metaDescription) {
        metaDescription.setAttribute('content', prevDescription)
      }
    }
  }, [title, description])
}
