import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, SlidersHorizontal, BellPlus, SearchX, Map as MapIcon, List, LayoutGrid, ShieldCheck, Zap, BadgeCheck, Sparkles } from 'lucide-react'
import { INDIAN_STATES } from '../data/states'
import { PropertyCard } from '../components/PropertyCard'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PropertyTypeScroller } from '../components/PropertyTypeScroller'
import { DateRangePicker } from '../components/DateRangePicker'
import { Reveal } from '../components/Reveal'
import { SearchSummary } from '../components/SearchSummary'
import { SortDropdown, type SortOption } from '../components/SortDropdown'
import { QuickViewModal } from '../components/QuickViewModal'
import { MobileFilterSheet } from '../components/MobileFilterSheet'
import { getQuickFilter, QUICK_FILTERS } from '../data/quickFilters'
import { useSavedSearch } from '../context/SavedSearchContext'
import { useToast } from '../context/ToastContext'
import { useProperties } from '../context/PropertiesContext'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Property, PropertyType } from '../types'

const ALL_AMENITIES = ['Wi-Fi', 'AC', 'Meals', 'Housekeeping', 'Parking', 'Gym', 'Pool', 'Power Backup']

const MAX_BUDGET = 10000

const SUGGESTED_FILTER_SLUGS = ['budget-picks', 'top-rated', 'near-metro', 'family-stay']

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

function MoreFiltersPopover({
  tenantPref,
  onTenantPrefChange,
  amenities,
  amenityOptions,
  onToggleAmenity,
}: {
  tenantPref: string
  onTenantPrefChange: (v: string) => void
  amenities: string[]
  amenityOptions: string[]
  onToggleAmenity: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeCount = (tenantPref !== 'all' ? 1 : 0) + (amenities.length > 0 ? 1 : 0)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-64 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Preferred Tenant</p>
              <select
                value={tenantPref}
                onChange={(e) => onTenantPrefChange(e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
              >
                <option value="all">Any</option>
                <option value="Anyone">Co-ed / Anyone</option>
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Family">Family</option>
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Amenities</p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {amenityOptions.map((o) => (
                  <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <input type="checkbox" checked={amenities.includes(o)} onChange={() => onToggleAmenity(o)} className="accent-primary-600" />
                    {o}
                  </label>
                ))}
              </div>
            </div>
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
  usePageMeta('Search Villas, Holiday Homes & Vacation Rentals', 'Search verified villas, cabins, cottages, and farmhouses by destination, budget, guests, and amenities on innbly.')
  const [searchParams] = useSearchParams()
  const { addSavedSearch } = useSavedSearch()
  const { showToast } = useToast()
  const { properties } = useProperties()
  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties])

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
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false)
  const [instantBookOnly, setInstantBookOnly] = useState(false)
  const [guestFavouriteOnly, setGuestFavouriteOnly] = useState(false)
  const [checkIn, setCheckIn] = useState<string | null>(searchParams.get('checkIn'))
  const [checkOut, setCheckOut] = useState<string | null>(searchParams.get('checkOut'))
  const [collectionSlug, setCollectionSlug] = useState(searchParams.get('collection'))
  const [freeTextQuery] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<SortOption>('recommended')
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const collection = getQuickFilter(collectionSlug)

  const filtered = useMemo(() => {
    const result = properties.filter((p) => {
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
      if (freeCancellationOnly && !p.freeCancellation) return false
      if (instantBookOnly && !p.instantBook) return false
      if (guestFavouriteOnly && !(p.rating >= 4.5 && p.reviewCount >= 20)) return false
      if (collection && !collection.predicate(p)) return false
      return true
    })

    switch (sort) {
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      case 'price-low':
        return [...result].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...result].sort((a, b) => b.price - a.price)
      case 'luxury':
        return [...result].sort((a, b) => b.price - a.price || b.rating - a.rating)
      default:
        return result
    }
  }, [
    properties, city, state, guests, budget, tenantPref, propertyType, amenities, stayDuration,
    verifiedOnly, freeCancellationOnly, instantBookOnly, guestFavouriteOnly, collection, freeTextQuery, sort,
  ])

  // Global (unfiltered) counts for the Popular Filters sidebar checkboxes —
  // matches the mockup's static counts rather than recomputing against the
  // currently-active filter set, which would make the numbers jump around
  // as a user toggles the very checkbox they're looking at.
  const popularFilterCounts = useMemo(
    () => ({
      freeCancellation: properties.filter((p) => p.freeCancellation).length,
      instantBook: properties.filter((p) => p.instantBook).length,
      verified: properties.filter((p) => p.verified).length,
      guestFavourite: properties.filter((p) => p.rating >= 4.5 && p.reviewCount >= 20).length,
    }),
    [properties],
  )

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

  const clearAllFilters = () => {
    setCity('all')
    setState('all')
    setGuests('all')
    setBudget(MAX_BUDGET)
    setTenantPref('all')
    setPropertyType('all')
    setAmenities([])
    setStayDuration('all')
    setVerifiedOnly(false)
    setFreeCancellationOnly(false)
    setInstantBookOnly(false)
    setGuestFavouriteOnly(false)
    setCollectionSlug(null)
  }

  const filterControls = (stacked: boolean) => (
    <div className={stacked ? 'flex flex-col gap-4' : 'flex flex-wrap items-center gap-2.5'}>
      <div className={stacked ? 'w-full' : 'w-full max-w-xs sm:w-56'}>
        <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }} />
      </div>
      {!stacked && (
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
          <SlidersHorizontal className="h-4 w-4" /> Filters:
        </span>
      )}
      <SelectFilter label="📍 Location" value={city} onChange={setCity} options={cities.map((c) => ({ value: c, label: c }))} />
      <SelectFilter label="🗺️ State" value={state} onChange={setState} options={INDIAN_STATES.map((s) => ({ value: s, label: s }))} />
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
        label="📅 Stay Length"
        value={stayDuration}
        onChange={setStayDuration}
        options={[
          { value: 'short', label: 'Short Stay (< 1 week)' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly+' },
        ]}
      />
      <MoreFiltersPopover
        tenantPref={tenantPref}
        onTenantPrefChange={setTenantPref}
        amenities={amenities}
        amenityOptions={ALL_AMENITIES}
        onToggleAmenity={toggleAmenity}
      />
      <div className={stacked ? 'flex items-center justify-between' : 'ml-auto flex items-center gap-3'}>
        {!stacked && (
          <button
            onClick={handleSaveSearch}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
          >
            <BellPlus className="h-3.5 w-3.5" /> Save Search
          </button>
        )}
        <span className="text-xs font-bold text-slate-500">Verified Only</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="peer sr-only" />
          <div className="peer h-5 w-9 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
        </label>
      </div>
      {stacked && (
        <button
          onClick={handleSaveSearch}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600"
        >
          <BellPlus className="h-3.5 w-3.5" /> Save This Search
        </button>
      )}
    </div>
  )

  return (
    <section>
      <h1 className="sr-only">Search villas, holiday homes, cabins, cottages, and farmhouses</h1>

      {/* Sticky search & filter bar — stays fixed directly beneath the sticky brand header */}
      <div className="sticky top-20 z-30 space-y-3 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          {collection && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700">
              Showing: {collection.label}
            </div>
          )}
          <div className="mb-3 hidden sm:block">{filterControls(false)}</div>
          <PropertyTypeScroller active={propertyType} onChange={setPropertyType} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <SearchSummary properties={filtered} />
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`flex h-8 w-8 items-center justify-center transition ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`flex h-8 w-8 items-center justify-center transition ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row">
        {/* Popular Filters sidebar — desktop only, real functional checkboxes
            with global catalog counts (not decorative). */}
        <aside className="hidden shrink-0 lg:block lg:w-64">
          <div className="sticky top-52 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">Filters</h2>
              <button onClick={clearAllFilters} className="text-xs font-bold text-primary-600 hover:underline">
                Clear All
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Popular Filters</p>
              <div className="space-y-2.5">
                {[
                  { key: 'freeCancellation', label: 'Free Cancellation', icon: ShieldCheck, checked: freeCancellationOnly, onChange: setFreeCancellationOnly, count: popularFilterCounts.freeCancellation },
                  { key: 'instantBook', label: 'Instant Book', icon: Zap, checked: instantBookOnly, onChange: setInstantBookOnly, count: popularFilterCounts.instantBook },
                  { key: 'verified', label: 'Verified Properties', icon: BadgeCheck, checked: verifiedOnly, onChange: setVerifiedOnly, count: popularFilterCounts.verified },
                  { key: 'guestFavourite', label: 'Guest Favourite', icon: Sparkles, checked: guestFavouriteOnly, onChange: setGuestFavouriteOnly, count: popularFilterCounts.guestFavourite },
                ].map((f) => (
                  <label key={f.key} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-slate-700">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={f.checked}
                        onChange={(e) => f.onChange(e.target.checked)}
                        className="h-4 w-4 rounded accent-primary-600"
                      />
                      <f.icon className="h-3.5 w-3.5 text-slate-400" /> {f.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{f.count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Amenities</p>
              <MultiSelectFilter label="Select Amenities" values={amenities} options={ALL_AMENITIES} onToggle={toggleAmenity} />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sort By</p>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:w-3/5">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2' : 'flex flex-col gap-4'}>
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}>
                <PropertyCard property={p} onQuickView={setQuickViewProperty} />
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
              <button
                onClick={clearAllFilters}
                className="mt-5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700"
              >
                Clear all filters
              </button>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_FILTERS.filter((f) => SUGGESTED_FILTER_SLUGS.includes(f.slug)).map((f) => (
                  <button
                    key={f.slug}
                    onClick={() => {
                      clearAllFilters()
                      setCollectionSlug(f.slug)
                    }}
                    className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden shrink-0 lg:block lg:w-2/5">
          <div className="sticky top-52 h-[calc(100vh-14rem)]">
            <MapPlaceholder className="h-full w-full" label={`${filtered.length} pins on map`} />
          </div>
        </div>
      </div>

      {/* Mobile: floating filter + map toggle, above the bottom nav bar */}
      <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 sm:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </button>
        <button
          onClick={() => setMobileMapOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-800 shadow-xl ring-1 ring-slate-200"
        >
          <MapIcon className="h-3.5 w-3.5" /> Map
        </button>
      </div>

      <MobileFilterSheet open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} resultCount={filtered.length}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Sort by</span>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
        {filterControls(true)}
      </MobileFilterSheet>

      {mobileMapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white sm:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-extrabold text-slate-900">{filtered.length} stays on map</span>
            <button
              onClick={() => setMobileMapOpen(false)}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white"
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
          <MapPlaceholder className="flex-1" label={`${filtered.length} pins on map`} />
        </div>
      )}

      <QuickViewModal property={quickViewProperty} onClose={() => setQuickViewProperty(null)} />
    </section>
  )
}
