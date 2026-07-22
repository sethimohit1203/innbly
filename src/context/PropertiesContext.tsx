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

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [liveListings, setLiveListings] = useState<Property[]>([])

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

    return () => {
      cancelled = true
    }
  }, [])

  const allProperties = [...staticProperties, ...liveListings]

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
