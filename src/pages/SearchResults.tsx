import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, SlidersHorizontal, BellPlus, SearchX } from 'lucide-react'
import { properties } from '../data/properties'
import { INDIAN_STATES } from '../data/states'
import { PropertyCard } from '../components/PropertyCard'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PropertyTypeScroller } from '../components/PropertyTypeScroller'
import { DateRangePicker } from '../components/DateRangePicker'
import { Reveal } from '../components/Reveal'
import { getQuickFilter } from '../data/quickFilters'
import { useSavedSearch } from '../context/SavedSearchContext'
import { useToast } from '../context/ToastContext'
import { usePageMeta } from '../hooks/usePageMeta'
import type { PropertyType } from '../types'

const cities = Array.from(new Set(properties.map((p) => p.city)))
const ALL_AMENITIES = ['Wi-Fi', 'AC', 'Meals', 'Housekeeping', 'Parking', 'Gym', 'Pool', 'Power Backup']

const MAX_BUDGET = 10000

function BudgetSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex min-w-[11rem] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <label htmlFor="budget-slider" className="shrink-0 text-xs font-bold text-slate-500">
        💰 ≤ ₹{value === MAX_BUDGET ? `${MAX_BUDGET}+` : value.toLocaleString('en-IN')}
      </label>
      <input
        id="budget-slider"
        type="range"
        min={500}
        max={MAX_BUDGET}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 accent-primary-600"
      />
    </div>
  )
}

function MultiSelectFilter({
  label,
  values,
  options,
  onToggle,
}: {
  label: string
  values: string[]
  options: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
      >
        {values.length ? `🛎️ ${values.length} Amenities` : label}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-40 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-card-hover">
            {options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <input type="checkbox" checked={values.includes(o)} onChange={() => onToggle(o)} className="accent-primary-600" />
                {o}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
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
  usePageMeta('Search Stays', 'Search verified PGs, coliving spaces, and rentals by city, budget, guests, and amenities on innbly.')
  const [searchParams] = useSearchParams()
  const { addSavedSearch } = useSavedSearch()
  const { showToast } = useToast()

  const [city, setCity] = useState(searchParams.get('city') ?? 'all')
  const [state, setState] = useState('all')
  const [guests, setGuests] = useState(searchParams.get('guests') ?? 'all')
  const [budget, setBudget] = useState(Number(searchParams.get('budget')) || MAX_BUDGET)
  const [tenantPref, setTenantPref] = useState('all')
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('all')
  const [amenities, setAmenities] = useState<string[]>([])
  const toggleAmenity = (a: string) => setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  const [stayDuration, setStayDuration] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [checkIn, setCheckIn] = useState<string | null>(searchParams.get('checkIn'))
  const [checkOut, setCheckOut] = useState<string | null>(searchParams.get('checkOut'))
  const [collectionSlug] = useState(searchParams.get('collection'))
  const [freeTextQuery] = useState(searchParams.get('q') ?? '')

  const collection = getQuickFilter(collectionSlug)

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (freeTextQuery) {
        const haystack = `${p.title} ${p.city} ${p.neighborhood}`.toLowerCase()
        if (!haystack.includes(freeTextQuery.toLowerCase())) return false
      }
      if (city !== 'all' && p.city !== city) return false
      if (state !== 'all' && p.state !== state) return false
      if (guests !== 'all' && p.maxGuests < Number(guests)) return false
      if (budget < MAX_BUDGET && p.price > budget) return false
      if (tenantPref !== 'all' && p.tenantPreference !== tenantPref) return false
      if (propertyType !== 'all' && p.propertyType !== propertyType) return false
      if (amenities.length > 0 && !amenities.every((a) => p.amenities.includes(a))) return false
      if (stayDuration === 'short' && p.minStayNights > 6) return false
      if (stayDuration === 'weekly' && (p.minStayNights < 7 || p.minStayNights > 29)) return false
      if (stayDuration === 'monthly' && p.minStayNights < 30) return false
      if (verifiedOnly && !p.verified) return false
      if (collection && !collection.predicate(p)) return false
      return true
    })
  }, [city, state, guests, budget, tenantPref, propertyType, amenities, stayDuration, verifiedOnly, collection, freeTextQuery])

  const handleSaveSearch = () => {
    const parts = [
      city !== 'all' ? city : null,
      guests !== 'all' ? `${guests}+ guests` : null,
      budget < MAX_BUDGET ? `under ₹${budget}` : null,
      collection ? collection.label : null,
    ].filter(Boolean)
    addSavedSearch({
      label: parts.length ? parts.join(' · ') : 'All stays',
      notifyBudgetDrop: true,
      notifyNewProperty: true,
      notifyRoomAvailable: true,
    })
    showToast('Search saved! You can manage alerts from your saved searches.')
  }

  return (
    <section>
      <h1 className="sr-only">Search PGs, coliving spaces, and rentals</h1>

      {/* Sticky search & filter bar — stays fixed directly beneath the sticky brand header */}
      <div className="sticky top-20 z-30 space-y-3 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          {collection && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700">
              Showing: {collection.label}
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <div className="w-full max-w-xs sm:w-56">
              <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }} />
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
              <SlidersHorizontal className="h-4 w-4" /> Filters:
            </span>
            <SelectFilter label="📍 Location" value={city} onChange={setCity} options={cities.map((c) => ({ value: c, label: c }))} />
            <SelectFilter
              label="🗺️ State"
              value={state}
              onChange={setState}
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            />
            <SelectFilter
              label="🧑‍🤝‍🧑 Guests"
              value={guests}
              onChange={setGuests}
              options={[
                { value: '1', label: '1 Guest' },
                { value: '2', label: '2 Guests' },
                { value: '4', label: '4 Guests' },
                { value: '6', label: '6+ Guests' },
              ]}
            />
            <BudgetSlider value={budget} onChange={setBudget} />
            <SelectFilter
              label="👤 Tenant"
              value={tenantPref}
              onChange={setTenantPref}
              options={[
                { value: 'Anyone', label: 'Co-ed / Anyone' },
                { value: 'Boys', label: 'Boys Only' },
                { value: 'Girls', label: 'Girls Only' },
                { value: 'Family', label: 'Family' },
              ]}
            />
            <MultiSelectFilter label="🛎️ Amenity" values={amenities} options={ALL_AMENITIES} onToggle={toggleAmenity} />
            <SelectFilter
              label="📅 Stay Length"
              value={stayDuration}
              onChange={setStayDuration}
              options={[
                { value: 'short', label: 'Short Stay (< 1 week)' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly+' },
              ]}
            />
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleSaveSearch}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
              >
                <BellPlus className="h-3.5 w-3.5" /> Save Search
              </button>
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

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row">
        <div className="md:w-3/5">
          <p className="mb-4 text-sm font-semibold text-slate-500">{filtered.length} stays found</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <SearchX className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-700">No stays match your filters</p>
              <p className="mt-1 max-w-xs text-sm text-slate-400">
                Try widening your budget, clearing an amenity, or choosing a nearby city.
              </p>
            </div>
          )}
        </div>

        <div className="hidden shrink-0 md:block md:w-2/5">
          <div className="sticky top-52 h-[calc(100vh-14rem)]">
            <MapPlaceholder className="h-full w-full" label={`${filtered.length} pins on map`} />
          </div>
        </div>
      </div>
    </section>
  )
}
