import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, PlusCircle } from 'lucide-react'
import { Footer } from './Footer'

const TABS = [
  { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/properties', label: 'Manage Properties', icon: Building2, end: false },
  { to: '/dashboard/leads', label: 'Leads Tracker', icon: Users, end: false },
]

export function HostDashboardLayout() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Host Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your listings and track incoming tenant leads.</p>
          </div>
          <NavLink
            to="/dashboard/list-property"
            className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
          >
            <PlusCircle className="h-4.5 w-4.5" /> List Your Property
          </NavLink>
        </div>

        <div className="mt-6 flex gap-1.5 overflow-x-auto border-b border-slate-200">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`
              }
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </section>
      <Footer />
    </>
  )
}
