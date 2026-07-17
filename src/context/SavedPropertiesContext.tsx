import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'innbly_saved_properties'

interface SavedPropertiesContextValue {
  savedIds: string[]
  isSaved: (id: string) => boolean
  toggleSaved: (id: string) => void
}

const SavedPropertiesContext = createContext<SavedPropertiesContextValue | null>(null)

export function SavedPropertiesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
  }, [savedIds])

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <SavedPropertiesContext.Provider value={{ savedIds, isSaved: (id) => savedIds.includes(id), toggleSaved }}>
      {children}
    </SavedPropertiesContext.Provider>
  )
}

export function useSavedProperties() {
  const ctx = useContext(SavedPropertiesContext)
  if (!ctx) throw new Error('useSavedProperties must be used within SavedPropertiesProvider')
  return ctx
}
