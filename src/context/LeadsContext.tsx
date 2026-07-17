import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Lead } from '../types'

const STORAGE_KEY = 'innbly_leads'
const MY_VISITS_KEY = 'innbly_my_visit_ids'

interface LeadsContextValue {
  leads: Lead[]
  myVisitIds: string[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
}

const LeadsContext = createContext<LeadsContextValue | null>(null)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Lead[]) : []
    } catch {
      return []
    }
  })

  const [myVisitIds, setMyVisitIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(MY_VISITS_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem(MY_VISITS_KEY, JSON.stringify(myVisitIds))
  }, [myVisitIds])

  const addLead: LeadsContextValue['addLead'] = (lead) => {
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setLeads((prev) => [newLead, ...prev])
    setMyVisitIds((prev) => [newLead.id, ...prev])
  }

  return <LeadsContext.Provider value={{ leads, myVisitIds, addLead }}>{children}</LeadsContext.Provider>
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider')
  return ctx
}
