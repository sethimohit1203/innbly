import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  PlusCircle,
  Receipt,
  IndianRupee,
  Menu,
  X,
  Settings,
  Globe,
  BookOpen,
  HelpCircle,
  UserPlus,
  Gift,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Footer } from './Footer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNewBookingsCount, markBookingsSeen } from '../hooks/useNewBookingsCount'

const TABS = [
  { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/properties', label: 'Manage Properties', icon: Building2, end: false },
  { to: '/dashboard/pricing', label: 'Pricing & Calendar', icon: IndianRupee, end: false },
  { to: '/dashboard/bookings', label: 'Bookings', icon: Receipt, end: false },
  { to: '/dashboard/leads', label: 'Leads Tracker', icon: Users, end: false },
]

export function HostDashboardLayout() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const newBookingsCount = useNewBookingsCount(user?.email)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.email && location.pathname === '/dashboard/bookings') {
      markBookingsSeen(user.email)
    }
  }, [user?.email, location.pathname])

  const comingSoon = (feature: string) => {
    showToast(`${feature} is coming soon.`)
    setMenuOpen(false)
  }

  const menuItems = [
    { icon: Settings, label: 'Account settings', onClick: () => { navigate('/profile'); setMenuOpen(false) } },
    { icon: Globe, label: 'Languages & currency', onClick: () => comingSoon('Languages & currency') },
    { icon: BookOpen, label: 'Hosting resources', onClick: () => comingSoon('Hosting resources') },
    { icon: HelpCircle, label: 'Get help', onClick: () => { navigate('/contact'); setMenuOpen(false) } },
    { icon: UserPlus, label: 'Find a co-host', onClick: () => comingSoon('Find a co-host') },
    { icon: PlusCircle, label: 'Create a new listing', onClick: () => { navigate('/dashboard/list-property'); setMenuOpen(false) } },
    { icon: Gift, label: 'Refer a host', onClick: () => { navigate('/invite'); setMenuOpen(false) } },
  ]

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Host Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your listings and track incoming tenant leads.</p>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard/list-property"
              className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
            >
              <PlusCircle className="h-4.5 w-4.5" /> List Your Property
            </NavLink>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
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
              {tab.to === '/dashboard/bookings' && newBookingsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {newBookingsCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </section>
      <Footer />

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Menu</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4.5 w-4.5 text-slate-400" /> {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>

            <div className="my-4 h-px bg-slate-100" />

            <button
              onClick={() => {
                logout()
                setMenuOpen(false)
                navigate('/')
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4.5 w-4.5" /> Log out
            </button>
          </div>
        </>
      )}
    </>
  )
}
