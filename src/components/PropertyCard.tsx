import { Link } from 'react-router-dom'
import { MapPin, BadgeCheck, Star } from 'lucide-react'
import type { Property } from '../types'

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/property/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {property.verified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-accent-700 shadow">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white">
          {property.roomType}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-slate-900">{property.title}</h3>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {property.rating}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {property.neighborhood}, {property.city}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {property.tenantPreference}
          </span>
          {property.furnished && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Furnished
            </span>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="text-lg font-extrabold text-slate-900">₹{property.price.toLocaleString('en-IN')}</span>
            <span className="text-sm text-slate-500"> /month</span>
          </div>
          <span className="rounded-full border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-700 transition group-hover:bg-primary-50">
            View details
          </span>
        </div>
      </div>
    </Link>
  )
}
