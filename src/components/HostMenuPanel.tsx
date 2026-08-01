import {
  X,
  Settings,
  Globe,
  BookOpen,
  HelpCircle,
  UserPlus,
  PlusCircle,
  Gift,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Shared hosting-side slide-over menu — trigger lives in Navbar.tsx (the
 * hamburger button next to the host's name), so it's always reachable from
 * the real top nav bar rather than buried in page content. */
export function HostMenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  if (!open) return null

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  const menuItems = [
    { icon: Settings, label: 'Account settings', onClick: () => go('/profile') },
    { icon: Globe, label: 'Languages & currency', onClick: () => go('/dashboard/languages') },
    { icon: BookOpen, label: 'Hosting resources', onClick: () => go('/dashboard/resources') },
    { icon: HelpCircle, label: 'Get help', onClick: () => go('/contact') },
    { icon: UserPlus, label: 'Find a co-host', onClick: () => go('/dashboard/co-host') },
    { icon: PlusCircle, label: 'Create a new listing', onClick: () => go('/dashboard/list-property') },
    { icon: Gift, label: 'Refer a host', onClick: () => go('/invite') },
  ]

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">Menu</h2>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
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
            onClose()
            navigate('/')
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <LogOut className="h-4.5 w-4.5" /> Log out
        </button>
      </div>
    </>
  )
}
