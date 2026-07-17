import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from '../components/PropertyCard'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { FilterPills, type Filters } from '../components/FilterPills'

const priceInRange = (price: number, range: string) => {
  if (range === 'Under ₹8,000') return price < 8000
  if (range === '₹8,000–₹12,000') return price >= 8000 && price <= 12000
  if (range === '₹12,000–₹16,000') return price > 12000 && price <= 16000
  if (range === 'Above ₹16,000') return price > 16000
  return true
}

export function SearchResultsPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    priceRanges: [],
    roomTypes: [],
    tenantPrefs: [],
    amenities: [],
  })

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (query && !`${p.title} ${p.city} ${p.neighborhood}`.toLowerCase().includes(query.toLowerCase())) return false
      if (filters.priceRanges.length && !filters.priceRanges.some((r) => priceInRange(p.price, r))) return false
      if (filters.roomTypes.length && !filters.roomTypes.includes(p.roomType)) return false
      if (filters.tenantPrefs.length && !filters.tenantPrefs.includes(p.tenantPreference)) return false
      if (filters.amenities.length && !filters.amenities.every((a) => p.amenities.includes(a))) return false
      return true
    })
  }, [query, filters])

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-3 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, neighborhood, or property name"
              className="w-full rounded-full border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <FilterPills filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:w-3/5 scrollbar-thin">
          <p className="mb-4 text-sm text-slate-500">{filtered.length} stays found</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="mt-16 text-center text-slate-400">
              No properties match your filters. Try widening your search.
            </div>
          )}
        </div>

        <div className="hidden shrink-0 border-l border-slate-200 p-4 md:block md:w-2/5">
          <MapPlaceholder className="h-full w-full" label={`${filtered.length} pins on map`} />
        </div>
      </div>
    </div>
  )
}
