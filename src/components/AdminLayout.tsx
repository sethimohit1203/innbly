import { useEffect, useState } from 'react'
import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import { Lock, LayoutDashboard, Home, Users, MessageSquare, LogOut, RefreshCw } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'

export interface HostSubmission {
  id: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
  owner_name: string
  owner_email: string
  owner_phone: string
  property_title: string
  property_type: string
  description: string
  city: string
  neighborhood: string
  address: string
  max_guests: number
  price_per_night: number
  security_deposit: number
  amenities: string[]
  photo_urls: string[]
  document_urls: string[]
}

export interface Stats {
  configured: boolean
  message?: string
  counts: { leads: number; signups: number; contact: number; newsletter: number; hostListing: number }
  recent: { leads: string[][]; signups: string[][]; contact: string[][]; newsletter: string[][]; hostListing: string[][] }
}

export interface AdminOutletContext {
  stats: Stats | null
  loading: boolean
  submissions: HostSubmission[] | null
  submissionsConfigured: boolean
  submissionsMessage: string | null
  decidingId: string | null
  decide: (id: string, status: 'approved' | 'rejected' | 'pending') => void
  reload: () => void
}

export function useAdminData() {
  return useOutletContext<AdminOutletContext>()
}

const TABS = [
  { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'Manage Properties', icon: Home, end: false },
  { to: '/admin/leads', label: 'Leads Tracker', icon: Users, end: false },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, end: false },
]

export function AdminLayout() {
  usePageMeta('Admin Dashboard', 'innbly internal admin dashboard.')
  const [stats, setStats] = useState<Stats | null>(null)
  // Fail closed: until the first auth check resolves, treat the session as
  // unauthenticated rather than rendering dashboard chrome optimistically.
  const [needsAuth, setNeedsAuth] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<HostSubmission[] | null>(null)
  const [submissionsConfigured, setSubmissionsConfigured] = useState(true)
  const [submissionsMessage, setSubmissionsMessage] = useState<string | null>(null)
  const [decidingId, setDecidingId] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        setStats(await res.json())
        setNeedsAuth(false)
      } else {
        setNeedsAuth(true)
      }
    } catch {
      setNeedsAuth(true)
    } finally {
      setLoading(false)
      setAuthChecked(true)
    }
  }

  const loadSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/host-listings')
      if (res.ok) {
        const data = await res.json()
        setSubmissionsConfigured(data.configured !== false)
        setSubmissionsMessage(data.message ?? null)
        setSubmissions(data.submissions ?? [])
      } else if (res.status === 401) {
        setNeedsAuth(true)
      }
    } catch {
      // Leave submissions null — loadStats' own error handling already fails closed.
    }
  }

  const decide = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setDecidingId(id)
    const res = await fetch('/api/admin/host-listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) await loadSubmissions()
    setDecidingId(null)
  }

  const reload = () => {
    loadStats()
    loadSubmissions()
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setLoginError(data.error ?? 'Incorrect passcode')
      return
    }
    setPasscode('')
    await Promise.all([loadStats(), loadSubmissions()])
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setStats(null)
    setSubmissions(null)
    setNeedsAuth(true)
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    )
  }

  if (needsAuth) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-950 text-white">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">Admin Access</h1>
            <p className="mt-1 text-sm text-slate-500">Enter the admin passcode to continue.</p>
          </div>
          <input
            type="password"
            required
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          {loginError && <p className="mt-2 text-xs font-semibold text-rose-500">{loginError}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-stone-950 py-3 text-sm font-bold text-white transition hover:bg-black"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  const context: AdminOutletContext = {
    stats,
    loading,
    submissions,
    submissionsConfigured,
    submissionsMessage,
    decidingId,
    decide,
    reload,
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">All submissions received across the site.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reload}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </div>

      {stats && !stats.configured && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {stats.message}
        </div>
      )}

      <div className="mt-6 flex gap-1.5 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`
            }
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-8">
        <Outlet context={context} />
      </div>
    </div>
  )
}
