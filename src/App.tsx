import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthModal } from './components/AuthModal'
import { HostOnlyRoute } from './components/HostOnlyRoute'
import { HostDashboardLayout } from './components/HostDashboardLayout'
import { AdminLayout } from './components/AdminLayout'
import { MobileBottomNav } from './components/MobileBottomNav'
import { QuickMatchAssistant } from './components/QuickMatchAssistant'
import { HomePage } from './pages/Home'

// Everything below Home is lazy-loaded — Home is the most common landing
// page and stays in the main bundle; every other route (including the
// heavier react-hook-form/zod/Supabase-powered host form and the
// self-contained /enterprise demo area) only downloads when visited.
const SearchResultsPage = lazy(() => import('./pages/SearchResults').then((m) => ({ default: m.SearchResultsPage })))
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetail').then((m) => ({ default: m.PropertyDetailPage })))
const HostOverviewPage = lazy(() => import('./pages/host/HostOverview').then((m) => ({ default: m.HostOverviewPage })))
const HostPropertiesPage = lazy(() => import('./pages/host/HostProperties').then((m) => ({ default: m.HostPropertiesPage })))
const HostLeadsPage = lazy(() => import('./pages/host/HostLeads').then((m) => ({ default: m.HostLeadsPage })))
const ListPropertyPage = lazy(() => import('./pages/ListProperty').then((m) => ({ default: m.ListPropertyPage })))
const ContactPage = lazy(() => import('./pages/Contact').then((m) => ({ default: m.ContactPage })))
const PrivacyPage = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/Terms').then((m) => ({ default: m.TermsPage })))
const SavedPropertiesPage = lazy(() => import('./pages/SavedProperties').then((m) => ({ default: m.SavedPropertiesPage })))
const ProfilePage = lazy(() => import('./pages/Profile').then((m) => ({ default: m.ProfilePage })))
const InvitePage = lazy(() => import('./pages/Invite').then((m) => ({ default: m.InvitePage })))
const EnterpriseHomePage = lazy(() => import('./pages/enterprise/EnterpriseHome').then((m) => ({ default: m.EnterpriseHomePage })))
const EnterpriseSearchPage = lazy(() => import('./pages/enterprise/EnterpriseSearch').then((m) => ({ default: m.EnterpriseSearchPage })))
const EnterpriseDashboardPage = lazy(() => import('./pages/enterprise/EnterpriseDashboard').then((m) => ({ default: m.EnterpriseDashboardPage })))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverview').then((m) => ({ default: m.AdminOverviewPage })))
const AdminPropertiesPage = lazy(() => import('./pages/admin/AdminProperties').then((m) => ({ default: m.AdminPropertiesPage })))
const AdminLeadsPage = lazy(() => import('./pages/admin/AdminLeads').then((m) => ({ default: m.AdminLeadsPage })))
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessages').then((m) => ({ default: m.AdminMessagesPage })))
const ComparePage = lazy(() => import('./pages/Compare').then((m) => ({ default: m.ComparePage })))
const HostProfilePage = lazy(() => import('./pages/HostProfile').then((m) => ({ default: m.HostProfilePage })))

function RouteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route
            path="/dashboard"
            element={
              <HostOnlyRoute>
                <HostDashboardLayout />
              </HostOnlyRoute>
            }
          >
            <Route index element={<HostOverviewPage />} />
            <Route path="properties" element={<HostPropertiesPage />} />
            <Route path="leads" element={<HostLeadsPage />} />
          </Route>
          <Route
            path="/dashboard/list-property"
            element={
              <HostOnlyRoute>
                <ListPropertyPage />
              </HostOnlyRoute>
            }
          />
          <Route path="/saved" element={<SavedPropertiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/enterprise" element={<EnterpriseHomePage />} />
          <Route path="/enterprise/search" element={<EnterpriseSearchPage />} />
          <Route path="/enterprise/dashboard" element={<EnterpriseDashboardPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
          </Route>
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/host/:id" element={<HostProfilePage />} />
        </Routes>
        </Suspense>
      </main>
      <AuthModal />
      <MobileBottomNav />
      <QuickMatchAssistant />
    </div>
  )
}
