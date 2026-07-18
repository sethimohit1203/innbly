import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { LeadsProvider } from './LeadsContext'
import { ToastProvider } from './ToastContext'
import { VisitModalProvider } from './VisitModalContext'
import { SavedPropertiesProvider } from './SavedPropertiesContext'
import { RecentlyViewedProvider } from './RecentlyViewedContext'
import { CompareProvider } from './CompareContext'
import { SavedSearchProvider } from './SavedSearchContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <LeadsProvider>
          <SavedPropertiesProvider>
            <RecentlyViewedProvider>
              <CompareProvider>
                <SavedSearchProvider>
                  <VisitModalProvider>{children}</VisitModalProvider>
                </SavedSearchProvider>
              </CompareProvider>
            </RecentlyViewedProvider>
          </SavedPropertiesProvider>
        </LeadsProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
