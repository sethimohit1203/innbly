import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthModal } from './components/AuthModal'
import { ScheduleVisitModal } from './components/ScheduleVisitModal'
import { HomePage } from './pages/Home'
import { SearchResultsPage } from './pages/SearchResults'
import { PropertyDetailPage } from './pages/PropertyDetail'
import { HostDashboardPage } from './pages/HostDashboard'
import { ListPropertyPage } from './pages/ListProperty'
import { useVisitModal } from './context/VisitModalContext'

export default function App() {
  const { openVisitModal } = useVisitModal()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar onScheduleVisit={() => openVisitModal()} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/dashboard" element={<HostDashboardPage />} />
          <Route path="/dashboard/list-property" element={<ListPropertyPage />} />
        </Routes>
      </main>
      <AuthModal />
      <ScheduleVisitModal />
    </div>
  )
}
