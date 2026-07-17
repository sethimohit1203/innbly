import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { properties } from '../data/properties'
import { INDIAN_STATES } from '../data/states'
import { PropertyCard } from '../components/PropertyCard'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PropertyTypeScroller } from '../components/PropertyTypeScroller'
import { usePageMeta } from '../hooks/usePageMeta'
import type { PropertyType } from '../types'

const cities = Array.from(new Set(properties.map((p) => p.city)))

const budgetLimits: Record<string, number> = {
  '12000': 12000,
  '18000': 18000,
  '25000': 25000,
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-8 text-xs font-bold text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:border-primary-500"
      >
        <option value="all">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export function SearchResultsPage() {
  usePageMeta('Search Stays', 'Search verified PGs, coliving spaces, and rentals by city, budget, room type, and amenities on innbly.')
  const [searchParams] = useSearchParams()
  const [city, setCity] = useState(searchParams.get('city') ?? 'all')
  const [state, setState] = useState('all')
  const [roomType, setRoomType] = useState(searchParams.get('roomType') ?? 'all')
  const [budget, setBudget] = useState(searchParams.get('budget') ?? 'all')
  const [tenantPref, setTenantPref] = useState('all')
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (city !== 'all' && p.city !== city) return false
      if (state !== 'all' && p.state !== state) return false
      if (roomType !== 'all' && p.roomType !== roomType) return false
      if (budget !== 'all' && p.price > budgetLimits[budget]) return false
      if (tenantPref !== 'all' && p.tenantPreference !== tenantPref) return false
      if (propertyType !== 'all' && p.propertyType !== propertyType) return false
      if (verifiedOnly && !p.verified) return false
      return true
    })
  }, [city, state, roomType, budget, tenantPref, propertyType, verifiedOnly])

  return (
    <section className="flex h-[calc(100vh-80px)] flex-col">
      <h1 className="sr-only">Search PGs, coliving spaces, and rentals</h1>
      <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
                <SlidersHorizontal className="h-4 w-4" /> Filters:
              </span>
              <SelectFilter label="📍 Any Location" value={city} onChange={setCity} options={cities.map((c) => ({ value: c, label: c }))} />
              <SelectFilter
                label="🗺️ Any State"
                value={state}
                onChange={setState}
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              />
              <SelectFilter
                label="🛏️ Any Room Type"
                value={roomType}
                onChange={setRoomType}
                options={[
                  { value: 'Single', label: 'Single Room' },
                  { value: 'Sharing', label: 'Sharing' },
                ]}
              />
              <SelectFilter
                label="💰 Any Budget"
                value={budget}
                onChange={setBudget}
                options={[
                  { value: '12000', label: 'Under ₹12,000/mo' },
                  { value: '18000', label: 'Under ₹18,000/mo' },
                  { value: '25000', label: 'Under ₹25,000/mo' },
                ]}
              />
              <SelectFilter
                label="👤 Any Tenant"
                value={tenantPref}
                onChange={setTenantPref}
                options={[
                  { value: 'Anyone', label: 'Co-ed / Anyone' },
                  { value: 'Boys', label: 'Boys Only' },
                  { value: 'Girls', label: 'Girls Only' },
                  { value: 'Family', label: 'Family' },
                ]}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Verified Only</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          </div>
          <PropertyTypeScroller active={propertyType} onChange={setPropertyType} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:w-3/5 scrollbar-thin">
          <p className="mb-4 text-sm font-semibold text-slate-500">{filtered.length} stays found</p>
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
    </section>
  )
}
