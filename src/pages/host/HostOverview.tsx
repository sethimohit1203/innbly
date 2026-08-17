import { useEffect, useState } from 'react'
import { Link } from '~links'
import { Home, Clock, Users, ArrowRight, Phone, Calendar } from 'lucide-react'
import { useLeads } from '../../context/LeadsContext'
import { usePageMeta } from '../../hooks/usePageMeta'

interface HostListing {
  id: string
  property_title: string
  status: 'pending' | 'approved' | 'rejected'
  price_per_night: number
  city: string
  neighborhood: string
  created_at: string
  photo_urls: string[]
}

export function HostOverviewPage() {
  usePageMeta('Dashboard Overview', 'Your host dashboard summary — listings, pending reviews, and leads at a glance.')
  
  const { leads } = useLeads()
  const [listings, setListings] = useState<HostListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth?action=my-listings')
      .then((res) => res.json())
      .then((data) => {
        if (data.listings) {
          setListings(data.listings)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  const liveListings = listings.filter((l) => l.status === 'approved')
  const pendingCount = listings.filter((l) => l.status === 'pending').length
  const recentLeads = leads.slice(0, 3)

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-stone-800 bg-white p-5 shadow-card">
          <Home className="h-6 w-6 text-primary-600" />
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{liveListings.length}</p>
          <p className="text-sm text-slate-500">Live listings</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-stone-800 bg-white p-5 shadow-card">
          <Clock className="h-6 w-6 text-amber-500" />
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{pendingCount}</p>
          <p className="text-sm text-slate-500">Pending review</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-stone-800 bg-white p-5 shadow-card">
          <Users className="h-6 w-6 text-accent-600" />
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{leads.length}</p>
          <p className="text-sm text-slate-500">Incoming leads</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Listings</h2>
          <Link to="/dashboard/properties" className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:underline">
            Manage Properties <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-stone-800 py-12 text-center text-slate-400">
            <p className="font-semibold text-slate-600">You haven't listed a property yet.</p>
            <p className="mt-1 text-sm">Submit your listing to track its review and performance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {liveListings.slice(0, 2).map((p) => (
              <Link
                key={p.id}
                to={`/property/host-${p.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-stone-800 bg-white p-4 shadow-card transition hover:shadow-card-hover"
              >
                <img src={p.photo_urls[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} className="h-16 w-20 rounded-xl object-cover" alt={p.property_title} />
                <div>
                  <p className="font-semibold text-slate-800 truncate max-w-[150px]">{p.property_title}</p>
                  <p className="text-sm text-slate-500">
                    {p.neighborhood}, {p.city} · ₹{p.price_per_night.toLocaleString('en-IN')}/night
                  </p>
                </div>
              </Link>
            ))}
            {pendingCount > 0 && liveListings.length < 2 && (
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-4">
                <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                  <Clock className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold text-slate-700">Pending Review</p>
                  <p className="text-sm text-slate-500">An admin hasn't approved this submission yet.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Leads</h2>
          <Link to="/dashboard/leads" className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:underline">
            Leads Tracker <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-stone-800 bg-white shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-stone-800 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Phone Number</th>
                <th className="px-5 py-3 font-semibold">Property</th>
                <th className="px-5 py-3 font-semibold">Scheduled Visit</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No leads yet. Once guests schedule a visit, they'll show up here.
                  </td>
                </tr>
              )}
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 dark:border-stone-800 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{lead.name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{lead.propertyTitle}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> {lead.visitDate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
