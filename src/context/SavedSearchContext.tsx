import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'innbly_saved_searches'

export interface SavedSearch {
  id: string
  label: string
  notifyBudgetDrop: boolean
  notifyNewProperty: boolean
  notifyRoomAvailable: boolean
  createdAt: string
}

interface SavedSearchContextValue {
  savedSearches: SavedSearch[]
  addSavedSearch: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void
  removeSavedSearch: (id: string) => void
}

const SavedSearchContext = createContext<SavedSearchContextValue | null>(null)

export function SavedSearchProvider({ children }: { children: ReactNode }) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedSearch[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSearches))
  }, [savedSearches])

  const addSavedSearch: SavedSearchContextValue['addSavedSearch'] = (search) => {
    setSavedSearches((prev) => [{ ...search, id: `search_${Date.now()}`, createdAt: new Date().toISOString() }, ...prev])
  }

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <SavedSearchContext.Provider value={{ savedSearches, addSavedSearch, removeSavedSearch }}>
      {children}
    </SavedSearchContext.Provider>
  )
}

export function useSavedSearch() {
  const ctx = useContext(SavedSearchContext)
  if (!ctx) throw new Error('useSavedSearch must be used within SavedSearchProvider')
  return ctx
}
