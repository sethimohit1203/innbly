import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthModal } from './components/AuthModal'
import { HomePage } from './pages/Home'
import { SearchResultsPage } from './pages/SearchResults'
import { PropertyDetailPage } from './pages/PropertyDetail'
import { HostDashboardPage } from './pages/HostDashboard'
import { ListPropertyPage } from './pages/ListProperty'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/dashboard" element={<HostDashboardPage />} />
        <Route path="/dashboard/list-property" element={<ListPropertyPage />} />
      </Routes>
      <AuthModal />
    </div>
  )
}
