import { Link } from 'react-router-dom'
import { MapPin, BadgeCheck, Star } from 'lucide-react'
import type { Property } from '../types'

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/property/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-slate-900 shadow-sm backdrop-blur-md">
          {property.roomType}
        </span>
        {property.verified && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-accent-400 backdrop-blur-md">
            <BadgeCheck className="h-3.5 w-3.5" /> Audit Pass
          </span>
        )}
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
        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-4">
          <div>
            <span className="text-xl font-extrabold text-slate-900">₹{property.price.toLocaleString('en-IN')}</span>
            <span className="block text-xs font-semibold text-slate-400"> / month</span>
          </div>
          <span className="rounded-xl bg-primary-50 px-4 py-2.5 text-xs font-bold text-primary-700 transition group-hover:bg-primary-100">
            Check Room
          </span>
        </div>
      </div>
    </Link>
  )
}
