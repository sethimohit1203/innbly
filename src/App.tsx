import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { TopBanner } from './components/TopBanner'
import { AuthModal } from './components/AuthModal'
import { ScheduleVisitModal } from './components/ScheduleVisitModal'
import { HomePage } from './pages/Home'
import { SearchResultsPage } from './pages/SearchResults'
import { PropertyDetailPage } from './pages/PropertyDetail'
import { HostDashboardPage } from './pages/HostDashboard'
import { ListPropertyPage } from './pages/ListProperty'
import { ContactPage } from './pages/Contact'
import { PrivacyPage } from './pages/Privacy'
import { TermsPage } from './pages/Terms'
import { SavedPropertiesPage } from './pages/SavedProperties'
import { MyVisitsPage } from './pages/MyVisits'
import { HostOnlyRoute } from './components/HostOnlyRoute'
import { EnterpriseHomePage } from './pages/enterprise/EnterpriseHome'
import { EnterpriseSearchPage } from './pages/enterprise/EnterpriseSearch'
import { EnterpriseDashboardPage } from './pages/enterprise/EnterpriseDashboard'
import { AdminPage } from './pages/Admin'
import { ComparePage } from './pages/Compare'
import { HostProfilePage } from './pages/HostProfile'
import { MobileBottomNav } from './components/MobileBottomNav'
import { QuickMatchAssistant } from './components/QuickMatchAssistant'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopBanner />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route
            path="/dashboard"
            element={
              <HostOnlyRoute>
                <HostDashboardPage />
              </HostOnlyRoute>
            }
          />
          <Route
            path="/dashboard/list-property"
            element={
              <HostOnlyRoute>
                <ListPropertyPage />
              </HostOnlyRoute>
            }
          />
          <Route path="/saved" element={<SavedPropertiesPage />} />
          <Route path="/my-visits" element={<MyVisitsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/enterprise" element={<EnterpriseHomePage />} />
          <Route path="/enterprise/search" element={<EnterpriseSearchPage />} />
          <Route path="/enterprise/dashboard" element={<EnterpriseDashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/host/:id" element={<HostProfilePage />} />
        </Routes>
      </main>
      <AuthModal />
      <ScheduleVisitModal />
      <MobileBottomNav />
      <QuickMatchAssistant />
    </div>
  )
}
