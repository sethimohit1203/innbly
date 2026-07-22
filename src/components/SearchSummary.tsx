import { Zap, BadgeCheck, Sparkles } from 'lucide-react'
import type { Property } from '../types'

export function SearchSummary({ properties }: { properties: Property[] }) {
  const count = properties.length
  const avgPrice = count ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / count) : 0
  const instantBookCount = properties.filter((p) => p.instantBook).length
  const verifiedCount = properties.filter((p) => p.verified).length
  const favouriteCount = properties.filter((p) => p.rating >= 4.5 && p.reviewCount >= 20).length

  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
      <span className="font-extrabold text-slate-900">
        {count} stay{count === 1 ? '' : 's'} found
      </span>
      <span className="text-slate-400">·</span>
      <span className="font-semibold text-slate-500">Avg ₹{avgPrice.toLocaleString('en-IN')}/night</span>
      {instantBookCount > 0 && (
        <span className="flex items-center gap-1 font-semibold text-primary-600">
          <Zap className="h-3.5 w-3.5" /> {instantBookCount} Instant Book
        </span>
      )}
      {verifiedCount > 0 && (
        <span className="flex items-center gap-1 font-semibold text-accent-700">
          <BadgeCheck className="h-3.5 w-3.5" /> {verifiedCount} Verified
        </span>
      )}
      {favouriteCount > 0 && (
        <span className="flex items-center gap-1 font-semibold text-amber-600">
          <Sparkles className="h-3.5 w-3.5" /> {favouriteCount} Guest Favourite
        </span>
      )}
    </div>
  )
}
