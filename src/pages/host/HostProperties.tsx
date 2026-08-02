import { Link } from '~links'
import { Clock, MapPin, Building2, Power, Briefcase, Plus } from 'lucide-react'
import { useProperties } from '../../context/PropertiesContext'
import { getMyListingIds } from '../../lib/myListings'
import { usePageMeta } from '../../hooks/usePageMeta'

export function HostPropertiesPage() {
  usePageMeta('Manage Properties', 'View and manage every property you have listed on innbly.')
  const { properties } = useProperties()

  // Cross-reference local browser submitted IDs against approved ones
  const myListingIds = getMyListingIds()
  const myLiveListings = properties.filter((p) => p.id.startsWith('host-') && myListingIds.includes(p.id.replace('host-', '')))
  const pendingCount = myListingIds.length - myLiveListings.length
  const totalCount = myListingIds.length
  const inactiveCount = 0

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Manage Properties</h2>
          <p className="text-sm text-slate-500 mt-1">View, edit and manage all your listed properties.</p>
        </div>
        
        {/* Horizontal Stats Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm min-w-[5.5rem]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-primary-600">
              <Building2 className="h-4 w-4" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-slate-900 leading-none">{myLiveListings.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Live</span>
            </div>
          </div>
          {/* Pending */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm min-w-[5.5rem]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Clock className="h-4 w-4" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-slate-900 leading-none">{pendingCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</span>
            </div>
          </div>
          {/* Inactive */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm min-w-[5.5rem]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-500">
              <Power className="h-4 w-4" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-slate-900 leading-none">{inactiveCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Inactive</span>
            </div>
          </div>
          {/* Total */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm min-w-[5.5rem]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <Briefcase className="h-4 w-4" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-slate-900 leading-none">{totalCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      {myListingIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 py-20 text-center shadow-sm">
          {/* Custom SVG house vector with plus symbol illustration matching Image 1 */}
          <div className="relative mb-6 flex h-36 w-36 items-center justify-center">
            {/* Background vector lines / clouds */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-50/40 to-amber-50/20 rounded-full blur-xl opacity-60" />
            <svg
              className="h-28 w-28 text-slate-200 stroke-1.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {/* Red circle plus overlap */}
            <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ring-4 ring-white">
              <Plus className="h-5 w-5 stroke-[3px]" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900">You haven't listed a property yet.</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm leading-relaxed">
            Submissions you make on this browser will show up here.
          </p>
          <Link
            to="/dashboard/list-property"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary-700 active:scale-95 transition"
          >
            <Plus className="h-4.5 w-4.5" /> List Your Property
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
                  <p className="font-bold text-slate-800 text-sm">{p.title}</p>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Live</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
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
                <p className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
                  Pending Review
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">Pending</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">An admin hasn't approved this submission yet.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
