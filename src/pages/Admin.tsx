import { useEffect, useState } from 'react'
import { Lock, Users, CalendarCheck, Mail, MessageSquare, LogOut, CreditCard, RefreshCw, Home, Check, X, Clock } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'

interface HostSubmission {
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

interface Stats {
  configured: boolean
  message?: string
  counts: { leads: number; signups: number; contact: number; newsletter: number; hostListing: number }
  recent: { leads: string[][]; signups: string[][]; contact: string[][]; newsletter: string[][]; hostListing: string[][] }
}

const SECTIONS: { key: keyof Stats['counts']; label: string; icon: typeof Users; headers: string[] }[] = [
  { key: 'leads', label: 'Visit Requests', icon: CalendarCheck, headers: ['Time', 'Name', 'Phone', 'Property', 'Visit Date', 'Slot'] },
  { key: 'signups', label: 'Signups', icon: Users, headers: ['Time', 'Name', 'Email', 'Role', 'Method'] },
  { key: 'contact', label: 'Contact Messages', icon: MessageSquare, headers: ['Time', 'Name', 'Email', 'Phone', 'Message'] },
  { key: 'newsletter', label: 'Newsletter Subscribers', icon: Mail, headers: ['Time', 'Email'] },
  {
    key: 'hostListing',
    label: 'Host Listings',
    icon: Home,
    headers: [
      'Time', 'Owner', 'Email', 'Phone', 'Title', 'Type', 'Description',
      'City', 'Neighborhood', 'Address', 'Guests', 'Price/Night', 'Deposit',
      'Amenities', 'Photos', 'Documents',
    ],
  },
]

export function AdminPage() {
  usePageMeta('Admin Dashboard', 'innbly internal admin dashboard.')
  const [stats, setStats] = useState<Stats | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<keyof Stats['counts']>('leads')
  const [submissions, setSubmissions] = useState<HostSubmission[] | null>(null)
  const [submissionsConfigured, setSubmissionsConfigured] = useState(true)
  const [submissionsMessage, setSubmissionsMessage] = useState<string | null>(null)
  const [decidingId, setDecidingId] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    if (res.status === 401) {
      setNeedsAuth(true)
      setLoading(false)
      return
    }
    if (res.ok) {
      setStats(await res.json())
      setNeedsAuth(false)
    }
    setLoading(false)
  }

  const loadSubmissions = async () => {
    const res = await fetch('/api/admin/host-listings')
    if (res.status === 401) {
      setNeedsAuth(true)
      return
    }
    if (res.ok) {
      const data = await res.json()
      setSubmissionsConfigured(data.configured !== false)
      setSubmissionsMessage(data.message ?? null)
      setSubmissions(data.submissions ?? [])
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

  useEffect(() => {
    loadStats()
    loadSubmissions()
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">All submissions received across the site.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { loadStats(); loadSubmissions() }}
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

      {/* Property approvals — approving here makes a submission a live, publicly searchable listing */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Property Approvals</h2>
            <p className="text-xs text-slate-500">Approving a submission makes it a live, publicly searchable listing.</p>
          </div>
        </div>

        {!submissionsConfigured ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {submissionsMessage ?? 'Connect Supabase (SUPABASE_SERVICE_ROLE_KEY) to review submissions here.'}
          </p>
        ) : submissions === null ? (
          <p className="text-sm text-slate-400">Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-slate-400">No host submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 font-bold text-slate-900">
                    {s.property_title}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        s.status === 'approved'
                          ? 'bg-accent-50 text-accent-700'
                          : s.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.property_type} · {s.neighborhood}, {s.city} · ₹{s.price_per_night}/night · by {s.owner_name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => decide(s.id, 'approved')}
                    disabled={decidingId === s.id || s.status === 'approved'}
                    className="flex items-center gap-1.5 rounded-lg border border-accent-300 bg-accent-50 px-3 py-1.5 text-xs font-bold text-accent-700 transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => decide(s.id, 'rejected')}
                    disabled={decidingId === s.id || s.status === 'rejected'}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  {s.status !== 'pending' && (
                    <button
                      onClick={() => decide(s.id, 'pending')}
                      disabled={decidingId === s.id}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Clock className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  activeSection === s.key ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <s.icon className="h-6 w-6 text-primary-600" />
                <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.counts[s.key]}</p>
                <p className="text-sm font-semibold text-slate-500">{s.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  {SECTIONS.find((s) => s.key === activeSection)!.headers.map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent[activeSection].length === 0 && (
                  <tr>
                    <td colSpan={SECTIONS.find((s) => s.key === activeSection)!.headers.length} className="px-5 py-8 text-center text-slate-400">
                      No entries yet.
                    </td>
                  </tr>
                )}
                {stats.recent[activeSection].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    {row.map((cell, j) => (
                      <td key={j} className="max-w-xs truncate px-5 py-3 text-slate-600">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Payments</h2>
                <p className="text-xs text-slate-500">Connect Razorpay to accept deposits and bookings.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">RAZORPAY_KEY_ID</code> and{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">RAZORPAY_KEY_SECRET</code> as environment
              variables (get free test-mode keys at{' '}
              <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">
                dashboard.razorpay.com/app/keys
              </a>
              ) to enable the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/api/payments/create-order</code> endpoint.
              Until then it safely returns "not configured" instead of charging anyone.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
