import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, openAuthModal, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary-700">
          <Home className="h-6 w-6" />
          innbly
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link to="/search" className="flex items-center gap-1.5 hover:text-primary-700">
            <Search className="h-4 w-4" /> Search
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-primary-700">
            <LayoutDashboard className="h-4 w-4" /> Host Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hi, {user.name.split(' ')[0]} · <span className="capitalize">{user.role}</span>
              </span>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700 hover:shadow-card-hover"
            >
              <User className="h-4 w-4" /> Sign up / Log in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
