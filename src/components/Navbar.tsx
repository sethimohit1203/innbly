import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, LayoutDashboard, User, Menu, X, CalendarCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TranslateWidget } from './TranslateWidget'

export function Navbar({ onScheduleVisit }: { onScheduleVisit?: () => void }) {
  const { user, openAuthModal, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/search', label: 'Explore Stays', icon: Search },
    { to: '/dashboard', label: 'Host Dashboard', icon: LayoutDashboard },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 glass-header">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/brand/innbly-icon.jpg" alt="innbly" className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-primary-500/20" />
          <span className="bg-gradient-to-r from-primary-900 to-primary-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            innbly
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-1.5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-primary-600"
            >
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <TranslateWidget />
          {onScheduleVisit && (
            <button
              onClick={onScheduleVisit}
              className="hidden items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-primary-600/10 transition-all hover:bg-primary-700 hover:shadow-primary-600/20 active:scale-95 sm:inline-flex"
            >
              <CalendarCheck className="h-4 w-4" /> Schedule a Visit
            </button>
          )}

          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm text-slate-600">
                Hi, {user.name.split(' ')[0]} · <span className="capitalize">{user.role}</span>
              </span>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="hidden items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700 sm:inline-flex"
            >
              <User className="h-4 w-4" /> Sign up / Log in
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
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <button
              onClick={() => {
                openAuthModal()
                setMobileOpen(false)
              }}
              className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
            >
              Sign up / Log in
            </button>
          )}
          {onScheduleVisit && (
            <button
              onClick={() => {
                onScheduleVisit()
                setMobileOpen(false)
              }}
              className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700"
            >
              Schedule a Visit
            </button>
          )}
        </div>
      )}
    </header>
  )
}
