import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { properties as staticProperties } from '../data/properties'
import { supabase } from '../lib/supabase'
import { mapApprovedListing, type ApprovedListingRow } from '../lib/mapApprovedListing'
import type { Property } from '../types'

interface PropertiesContextValue {
  properties: Property[]
  getPropertyById: (id: string) => Property | undefined
}

const PropertiesContext = createContext<PropertiesContextValue | null>(null)

interface ReviewRow {
  id: string
  property_id: string
  tenant_name: string
  rating: number
  comment: string
  created_at: string
}

/** Overlays real tenant reviews (from the post-stay review flow) onto a
 * property. Only overrides rating/reviewCount/reviews when real reviews
 * exist for that property id — static demo listings keep their curated
 * placeholder content until a real stay is actually reviewed. */
function applyRealReviews(property: Property, reviewsByProperty: Map<string, ReviewRow[]>): Property {
  const reviews = reviewsByProperty.get(property.id)
  if (!reviews || reviews.length === 0) return property

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return {
    ...property,
    rating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
    reviews: reviews.map((r) => ({
      id: r.id,
      name: r.tenant_name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.tenant_name)}`,
      occupation: 'Verified Guest',
      verifiedStay: true,
      wouldRecommend: r.rating >= 4,
      helpfulVotes: 0,
      date: new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      text: r.comment || 'Stayed here via innbly.',
    })),
  }
}

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [liveListings, setLiveListings] = useState<Property[]>([])
  const [reviewsByProperty, setReviewsByProperty] = useState<Map<string, ReviewRow[]>>(new Map())

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    supabase
      .from('approved_listings')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        setLiveListings((data as ApprovedListingRow[]).map(mapApprovedListing))
      })

    supabase
      .from('reviews')
      .select('id, property_id, tenant_name, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const grouped = new Map<string, ReviewRow[]>()
        for (const row of data as ReviewRow[]) {
          const list = grouped.get(row.property_id) ?? []
          list.push(row)
          grouped.set(row.property_id, list)
        }
        setReviewsByProperty(grouped)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const allProperties = [...staticProperties, ...liveListings].map((p) => applyRealReviews(p, reviewsByProperty))

  return (
    <PropertiesContext.Provider
      value={{
        properties: allProperties,
        getPropertyById: (id) => allProperties.find((p) => p.id === id),
      }}
    >
      {children}
    </PropertiesContext.Provider>
  )
}

export function useProperties() {
  const ctx = useContext(PropertiesContext)
  if (!ctx) throw new Error('useProperties must be used within PropertiesProvider')
  return ctx
}
