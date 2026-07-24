import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import { useProperties } from '../../context/PropertiesContext'
import { getMyListingIds } from '../../lib/myListings'
import { usePageMeta } from '../../hooks/usePageMeta'

export function HostPropertiesPage() {
  usePageMeta('Manage Properties', 'View and manage every property you have listed on innbly.')
  const { properties } = useProperties()

  // There's no real per-host backend session (see CLAUDE.md), so "my
  // listings" is this browser's own submitted IDs (src/lib/myListings.ts),
  // cross-referenced against the public approved_listings view. An id
  // submitted but not yet approved shows as "Pending Review" rather than
  // being silently missing.
  const myListingIds = getMyListingIds()
  const myLiveListings = properties.filter((p) => p.id.startsWith('host-') && myListingIds.includes(p.id.replace('host-', '')))
  const pendingCount = myListingIds.length - myLiveListings.length

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">Manage Properties</h2>
      <p className="mb-6 text-sm text-slate-500">
        {myListingIds.length} submission{myListingIds.length === 1 ? '' : 's'} total — {myLiveListings.length} live,{' '}
        {pendingCount} pending review.
      </p>

      {myListingIds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
          <p className="font-semibold text-slate-600">You haven't listed a property yet.</p>
          <p className="mt-1 text-sm">Submissions you make on this browser will show up here.</p>
          <Link
            to="/dashboard/list-property"
            className="mt-5 inline-block rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700"
          >
            List Your Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {myLiveListings.map((p) => (
            <Link
              key={p.id}
              to={`/property/${p.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
            >
              <img src={p.images[0]} className="h-16 w-20 rounded-xl object-cover" alt={p.title} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{p.title}</p>
                  <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-700">Live</span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {p.neighborhood}, {p.city} · ₹{p.price.toLocaleString('en-IN')}/night
                </p>
              </div>
            </Link>
          ))}
          {Array.from({ length: pendingCount }).map((_, i) => (
            <div
              key={`pending-${i}`}
              className="flex items-center gap-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-4"
            >
              <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                <Clock className="h-6 w-6" />
              </span>
              <div>
                <p className="flex items-center gap-2 font-semibold text-slate-700">
                  Pending Review
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Pending</span>
                </p>
                <p className="text-sm text-slate-500">An admin hasn't approved this submission yet.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
