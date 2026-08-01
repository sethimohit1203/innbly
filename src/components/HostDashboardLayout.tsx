import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NavLink } from '~links'
import {
  LayoutDashboard,
  Building2,
  Users,
  PlusCircle,
  Receipt,
  IndianRupee,
  MessageSquare,
  CalendarClock,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { Footer } from './Footer'
import { useAuth } from '../context/AuthContext'
import { useNewBookingsCount, markBookingsSeen } from '../hooks/useNewBookingsCount'

const NAV_SECTIONS: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] }[] = [
  {
    label: 'Hosting',
    items: [
      { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
      { to: '/dashboard/properties', label: 'Manage Properties', icon: Building2 },
      { to: '/dashboard/pricing', label: 'Pricing & Calendar', icon: IndianRupee },
      { to: '/dashboard/bookings', label: 'Bookings', icon: Receipt },
      { to: '/dashboard/leads', label: 'Leads Tracker', icon: Users },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarClock },
      { to: '/profile', label: 'Profile Settings', icon: Settings },
      { to: '/contact', label: 'Help & Support', icon: HelpCircle },
    ],
  },
]

/** Sidebar-based host dashboard shell — every /dashboard/* tab renders as an
 * <Outlet> inside this fixed sidebar, matching the standard SaaS-dashboard
 * layout (nav on the left, content on the right) rather than the previous
 * top-tab-bar layout. The global Navbar above this still owns the site-wide
 * identity/search chrome; this layout only owns hosting-specific nav. */
export function HostDashboardLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const newBookingsCount = useNewBookingsCount(user?.email)

  useEffect(() => {
    if (user?.email && location.pathname === '/dashboard/bookings') {
      markBookingsSeen(user.email)
    }
  }, [user?.email, location.pathname])

  return (
    <>
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between gap-3 lg:block">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Host Dashboard</h1>
                <p className="mt-0.5 text-xs text-slate-500">Manage your listings and leads.</p>
              </div>
              <NavLink
                to="/dashboard/list-property"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-xs font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover lg:mt-4 lg:w-full lg:justify-center"
              >
                <PlusCircle className="h-4 w-4" /> List Your Property
              </NavLink>
            </div>

            <nav className="mt-4 space-y-5 overflow-x-auto lg:overflow-visible">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{section.label}</p>
                  <div className="flex gap-1 lg:flex-col lg:gap-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                            isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" /> {item.label}
                        {item.to === '/dashboard/bookings' && newBookingsCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                            {newBookingsCount}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </section>
      <Footer />
    </>
  )
}
