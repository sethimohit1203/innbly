import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { LeadsProvider } from './LeadsContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LeadsProvider>{children}</LeadsProvider>
    </AuthProvider>
  )
}
