import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'innbly_recently_viewed'
const MAX_ITEMS = 8

interface RecentlyViewedContextValue {
  recentIds: string[]
  addRecentlyViewed: (id: string) => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null)

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds))
  }, [recentIds])

  const addRecentlyViewed = (id: string) => {
    setRecentIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, MAX_ITEMS))
  }

  return (
    <RecentlyViewedContext.Provider value={{ recentIds, addRecentlyViewed }}>{children}</RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext)
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
  return ctx
}
