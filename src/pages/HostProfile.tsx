import { useParams, Link } from 'react-router-dom'
import { BadgeCheck, Clock, TrendingUp, Calendar, Languages } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from '../components/PropertyCard'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

export function HostProfilePage() {
  const { id } = useParams()
  const ownerName = id ? decodeURIComponent(id) : ''
  const listings = properties.filter((p) => p.ownerName === ownerName)
  const host = listings[0]

  usePageMeta(host ? `${ownerName} — Host on innbly` : 'Host not found', host ? `View ${ownerName}'s verified listings on innbly.` : undefined)

  if (!host) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-slate-800">Host not found</h1>
        <Link to="/search" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card sm:flex-row sm:items-start sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-700">
            {ownerName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-extrabold text-slate-900">{ownerName}</h1>
              <span className="flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified Host
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{host.hostBio}</p>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-slate-900 sm:justify-start">
                  <Clock className="h-4 w-4 text-primary-600" /> {host.hostResponseTime.match(/\d+/)?.[0] ?? '—'}
                </p>
                <p className="text-xs font-semibold text-slate-500">Response Time</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-slate-900 sm:justify-start">
                  <TrendingUp className="h-4 w-4 text-primary-600" /> {host.hostResponseRate}%
                </p>
                <p className="text-xs font-semibold text-slate-500">Response Rate</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-slate-900 sm:justify-start">
                  <Calendar className="h-4 w-4 text-primary-600" /> {host.hostJoinedYear}
                </p>
                <p className="text-xs font-semibold text-slate-500">Joined Since</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-slate-900 sm:justify-start">
                  {host.hostTotalListings}
                </p>
                <p className="text-xs font-semibold text-slate-500">Total Listings</p>
              </div>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
              <Languages className="h-4 w-4" /> Speaks {host.hostLanguages.join(', ')}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">{ownerName}'s Listings</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
