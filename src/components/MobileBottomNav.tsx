import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { user, openAuthModal } = useAuth()

  const items = [
    { to: '/search', label: 'Search', icon: Search },
    { to: '/saved', label: 'Wishlist', icon: Heart },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur-md md:hidden">
      {items.map((item) => {
        const active = pathname === item.to
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${
              active ? 'text-primary-600' : 'text-slate-500'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
      {user ? (
        <Link
          to={user.role === 'host' ? '/dashboard' : '/saved'}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${
            pathname === '/dashboard' ? 'text-primary-600' : 'text-slate-500'
          }`}
        >
          <User className="h-5 w-5" />
          Profile
        </Link>
      ) : (
        <button onClick={() => openAuthModal()} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-slate-500">
          <User className="h-5 w-5" />
          Profile
        </button>
      )}
    </nav>
  )
}
