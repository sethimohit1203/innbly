import { properties } from '../data/properties'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { PropertyCard } from './PropertyCard'

export function RecentlyViewedSection() {
  const { recentIds } = useRecentlyViewed()
  const recent = recentIds.map((id) => properties.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p))

  if (recent.length === 0) return null

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Recently Viewed</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.slice(0, 4).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
