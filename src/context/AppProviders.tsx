import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { LeadsProvider } from './LeadsContext'
import { ToastProvider } from './ToastContext'
import { VisitModalProvider } from './VisitModalContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <LeadsProvider>
          <VisitModalProvider>{children}</VisitModalProvider>
        </LeadsProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
