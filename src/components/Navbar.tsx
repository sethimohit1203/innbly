import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  LayoutDashboard,
  Building2,
  Users,
  User,
  Menu,
  X,
  ChevronDown,
  CalendarClock,
  Heart,
  LogOut,
  PlusCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TranslateWidget } from './TranslateWidget'

export function Navbar() {
  const { user, openAuthModal, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const isHost = user?.role === 'host'
  const isTenant = user?.role === 'tenant'

  const hostLinks = [
    { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/dashboard#listings', label: 'Manage Properties', icon: Building2 },
    { to: '/dashboard#leads', label: 'Leads Tracker', icon: Users },
  ]

  const handleLogout = () => {
    logout()
    setAvatarOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/brand/innbly-icon.jpg" alt="innbly" className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-primary-500/20" />
          <span className="bg-gradient-to-r from-primary-900 to-primary-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            innbly
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {isHost
            ? hostLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  className="flex items-center gap-1.5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-primary-600"
                >
                  <link.icon className="h-4 w-4" /> {link.label}
                </a>
              ))
            : (
                <Link
                  to="/search"
                  className="flex items-center gap-1.5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-primary-600"
                >
                  <Search className="h-4 w-4" /> Explore
                </Link>
              )}
        </nav>

        <div className="flex items-center gap-3">
          <TranslateWidget />

          {!isHost && (
            <Link
              to="/dashboard/list-property"
              className="hidden items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-primary-600/10 transition-all hover:bg-primary-700 hover:shadow-primary-600/20 active:scale-95 sm:inline-flex"
            >
              <PlusCircle className="h-4 w-4" /> List Your Property
            </Link>
          )}

          {isHost && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm text-slate-600">Hi, {user!.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </div>
          )}

          {isTenant && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAvatarOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:border-slate-300"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {user!.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-slate-700">{user!.name.split(' ')[0]}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${avatarOpen ? 'rotate-180' : ''}`} />
              </button>

              {avatarOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAvatarOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-card-hover">
                    <Link
                      to="/my-visits"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <CalendarClock className="h-4 w-4 text-slate-400" /> My Scheduled Visits
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Heart className="h-4 w-4 text-slate-400" /> Saved Properties
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {!user && (
            <button
              onClick={openAuthModal}
              className="hidden items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700 sm:inline-flex"
            >
              <User className="h-4 w-4" /> Sign In
            </button>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 text-slate-600 transition-colors hover:text-primary-600 md:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-slate-100 bg-white/95 px-4 py-6 shadow-xl backdrop-blur-md md:hidden">
          {isHost ? (
            hostLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
              >
                {link.label}
              </a>
            ))
          ) : (
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
            >
              Explore
            </Link>
          )}

          {isTenant && (
            <>
              <Link to="/my-visits" onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700 hover:text-primary-600">
                My Scheduled Visits
              </Link>
              <Link to="/saved" onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700 hover:text-primary-600">
                Saved Properties
              </Link>
            </>
          )}

          {!user && (
            <button
              onClick={() => {
                openAuthModal()
                setMobileOpen(false)
              }}
              className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
            >
              Sign In
            </button>
          )}

          {user && (
            <button
              onClick={() => {
                handleLogout()
                setMobileOpen(false)
              }}
              className="block text-base font-semibold text-rose-600"
            >
              Log out
            </button>
          )}

          {!isHost && (
            <Link
              to="/dashboard/list-property"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-xl bg-primary-600 py-3 text-center font-semibold text-white shadow-lg transition-all hover:bg-primary-700"
            >
              List Your Property
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
