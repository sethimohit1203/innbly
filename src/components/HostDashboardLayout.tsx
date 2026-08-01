import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NavLink, Link } from '~links'
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
  ArrowRight,
  Home,
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
      { to: '/dashboard/pricing', label: 'Pricing & Calendar', icon: CalendarClock },
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
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row min-h-[75vh]">
        <aside className="shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between gap-3 lg:block">
              <NavLink
                to="/dashboard/list-property"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-primary-700 lg:w-full lg:justify-center mb-6"
              >
                <PlusCircle className="h-4.5 w-4.5" /> List Your Property
              </NavLink>
            </div>

            <nav className="mt-4 space-y-6 overflow-x-auto lg:overflow-visible">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{section.label}</p>
                  <div className="flex gap-1 lg:flex-col lg:gap-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                            isActive ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-650 hover:bg-slate-100'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-slate-400" /> {item.label}
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

            {/* Grow your bookings banner CTA */}
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-rose-50/70 via-red-50/40 to-amber-50/40 border border-rose-100 p-4 relative overflow-hidden hidden lg:block shadow-sm">
              <p className="text-xs font-extrabold text-slate-800">Grow your bookings</p>
              <p className="mt-1 text-[11px] text-slate-500 leading-normal max-w-[10rem]">
                List your property and start hosting verified guests.
              </p>
              <Link to="/dashboard/list-property" className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:underline">
                Get Started Now <ArrowRight className="h-3 w-3" />
              </Link>
              <div className="absolute -bottom-2 -right-2 text-primary-500 opacity-10 pointer-events-none">
                <Home className="h-16 w-16" />
              </div>
            </div>
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
