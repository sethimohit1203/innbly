import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { LeadsProvider } from './LeadsContext'
import { ToastProvider } from './ToastContext'
import { VisitModalProvider } from './VisitModalContext'
import { SavedPropertiesProvider } from './SavedPropertiesContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <LeadsProvider>
          <SavedPropertiesProvider>
            <VisitModalProvider>{children}</VisitModalProvider>
          </SavedPropertiesProvider>
        </LeadsProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
