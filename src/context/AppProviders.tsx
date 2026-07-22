import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { LeadsProvider } from './LeadsContext'
import { ToastProvider } from './ToastContext'
import { SavedPropertiesProvider } from './SavedPropertiesContext'
import { RecentlyViewedProvider } from './RecentlyViewedContext'
import { CompareProvider } from './CompareContext'
import { SavedSearchProvider } from './SavedSearchContext'
import { PropertiesProvider } from './PropertiesContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <LeadsProvider>
          <PropertiesProvider>
            <SavedPropertiesProvider>
              <RecentlyViewedProvider>
                <CompareProvider>
                  <SavedSearchProvider>{children}</SavedSearchProvider>
                </CompareProvider>
              </RecentlyViewedProvider>
            </SavedPropertiesProvider>
          </PropertiesProvider>
        </LeadsProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
