import { createContext, useContext, useState, type ReactNode } from 'react'

interface VisitTarget {
  propertyId: string
  propertyTitle: string
}

interface VisitModalContextValue {
  isOpen: boolean
  target: VisitTarget
  openVisitModal: (target?: VisitTarget) => void
  closeVisitModal: () => void
}

const DEFAULT_TARGET: VisitTarget = { propertyId: 'general', propertyTitle: 'General Inquiry' }

const VisitModalContext = createContext<VisitModalContextValue | null>(null)

export function VisitModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<VisitTarget>(DEFAULT_TARGET)

  return (
    <VisitModalContext.Provider
      value={{
        isOpen,
        target,
        openVisitModal: (t) => {
          setTarget(t ?? DEFAULT_TARGET)
          setIsOpen(true)
        },
        closeVisitModal: () => setIsOpen(false),
      }}
    >
      {children}
    </VisitModalContext.Provider>
  )
}

export function useVisitModal() {
  const ctx = useContext(VisitModalContext)
  if (!ctx) throw new Error('useVisitModal must be used within VisitModalProvider')
  return ctx
}
