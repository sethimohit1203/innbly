import { useLocation, useNavigate } from 'react-router-dom'
import { Link } from '~links'
import {
  X,
  LayoutDashboard,
  Building2,
  CalendarClock,
  Receipt,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ArrowRight,
  Home,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNewBookingsCount } from '../hooks/useNewBookingsCount'

export function HostMenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const newBookingsCount = useNewBookingsCount(user?.role === 'host' ? user.email : undefined)

  if (!open) return null

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  const HOSTING_LINKS = [
    { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/properties', label: 'Manage Properties', icon: Building2 },
    { to: '/dashboard/pricing', label: 'Pricing & Calendar', icon: CalendarClock },
    { to: '/dashboard/bookings', label: 'Bookings', icon: Receipt },
    { to: '/dashboard/leads', label: 'Leads Tracker', icon: Users },
  ]

  const ACCOUNT_LINKS = [
    { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: 5 },
    { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/profile', label: 'Profile Settings', icon: Settings },
    { to: '/contact', label: 'Help & Support', icon: HelpCircle },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300" onClick={onClose} />
      
      {/* Menu Drawer */}
      <div className="fixed inset-y-0 right-0 z-55 w-full max-w-[340px] bg-white p-5 shadow-2xl transition-all duration-300 animate-slide-in flex flex-col justify-between">
        
        {/* Scrollable links area */}
        <div className="overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {/* Header Profile Section */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5 relative">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-base font-bold text-primary-600 border border-rose-100 shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{user?.name || 'User'}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{user?.email || ''}</p>
                <span className="inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-primary-600 uppercase tracking-wide mt-1.5 border border-rose-100/50">
                  {user?.role || 'Host'}
                </span>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50/50 border border-rose-100 text-primary-650 hover:bg-rose-100/50 transition active:scale-95"
            >
              <X className="h-4.5 w-4.5 stroke-[2.5px]" />
            </button>
          </div>

          {/* Hosting Links */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hosting</p>
            <div className="space-y-1">
              {HOSTING_LINKS.map((link) => {
                const isActive = link.end 
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to)
                return (
                  <button
                    key={link.to}
                    onClick={() => go(link.to)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition text-left ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <link.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                      {link.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Account Links */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</p>
            <div className="space-y-1">
              {ACCOUNT_LINKS.map((link) => {
                const isActive = location.pathname === link.to
                return (
                  <button
                    key={link.to}
                    onClick={() => go(link.to)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition text-left ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <link.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                      {link.label}
                    </span>
                    {link.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[9px] font-extrabold text-white">
                        {link.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grow your bookings banner */}
          <div className="rounded-2xl bg-gradient-to-br from-rose-50/70 via-red-50/40 to-amber-50/40 border border-rose-100 p-4 relative overflow-hidden shadow-xs mb-6 text-left">
            <p className="text-xs font-extrabold text-slate-800">Grow your bookings</p>
            <p className="mt-1 text-[10px] text-slate-500 leading-normal max-w-[10rem]">
              List your property and start hosting verified guests.
            </p>
            <button 
              onClick={() => go('/dashboard/list-property')}
              className="mt-2.5 flex items-center gap-1 text-[10px] font-extrabold text-primary-650 hover:underline"
            >
              Get Started Now <ArrowRight className="h-3 w-3" />
            </button>
            <div className="absolute -bottom-2 -right-2 text-primary-500 opacity-10 pointer-events-none">
              <Home className="h-14 w-14" />
            </div>
          </div>
        </div>

        {/* Bottom Log out Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:border-slate-350 transition active:scale-95 shadow-sm"
          >
            <LogOut className="h-4 w-4 text-slate-400" /> Log out
          </button>
        </div>

      </div>
    </>
  )
}
