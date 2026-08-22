import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, SlidersHorizontal, BellPlus, SearchX, Map as MapIcon, List, LayoutGrid, ShieldCheck, Zap, BadgeCheck, Sparkles, Calendar, MapPin, Users, Wallet, ArrowRight, Heart, Search, Check } from 'lucide-react'
import { INDIAN_STATES } from '../data/states'
import { PropertyCard } from '../components/PropertyCard'
import { PropertyCardSkeleton } from '../components/SkeletonLoader'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PropertyTypeScroller } from '../components/PropertyTypeScroller'
import { DateRangePicker, formatDisplay } from '../components/DateRangePicker'
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
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <span className="text-slate-400 shrink-0">
        <Wallet className="h-4 w-4 text-slate-400" />
      </span>
      <div className="flex flex-col text-left min-w-[5.5rem]">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Price Range</span>
        <span className="text-xs font-extrabold text-slate-800">
          ₹0 - ₹{value === MAX_BUDGET ? `${MAX_BUDGET}+` : value.toLocaleString('en-IN')}
        </span>
      </div>
      <input
        id="budget-slider"
        type="range"
        min={500}
        max={MAX_BUDGET}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Maximum nightly price, up to ₹${value === MAX_BUDGET ? `${MAX_BUDGET}+` : value}`}
        className="w-20 h-1 bg-red-100 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
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
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
      >
        {values.length ? `🛎️ ${values.length} Selected` : label}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
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
  amenities,
  amenityOptions,
  onToggleAmenity,
}: {
  amenities: string[]
  amenityOptions: string[]
  onToggleAmenity: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeCount = amenities.length > 0 ? 1 : 0

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
      >
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Filters</span>
          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            More Filters
            {activeCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-64 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover">
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
  icon: Icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm relative">
      <span className="text-slate-400 shrink-0">
        <Icon className="h-4 w-4 text-slate-400" />
      </span>
      <div className="flex flex-col text-left min-w-[5.5rem] pr-6">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer appearance-none"
        >
          <option value="all">Any</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function SearchableLocationFilter({
  valueCity,
  valueState,
  onChange,
  properties,
}: {
  valueCity: string
  valueState: string
  onChange: (city: string, state: string) => void
  properties: Property[]
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))).sort(), [properties])
  const states = useMemo(() => Array.from(new Set(properties.map((p) => p.state))).sort(), [properties])

  const displayLabel = useMemo(() => {
    if (valueCity !== 'all') return valueCity
    if (valueState !== 'all') return valueState
    return 'Any Location'
  }, [valueCity, valueState])

  const filteredCities = useMemo(() => {
    return cities.filter((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [cities, searchQuery])

  const filteredStates = useMemo(() => {
    return states.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [states, searchQuery])

  const handleSelect = (type: 'all' | 'city' | 'state', name: string) => {
    if (type === 'all') {
      onChange('all', 'all')
    } else if (type === 'city') {
      onChange(name, 'all')
    } else if (type === 'state') {
      onChange('all', name)
    }
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300 transition text-left min-w-[7.5rem] pr-8 active:scale-98 relative"
      >
        <span className="text-slate-400 shrink-0">
          <MapPin className="h-4 w-4 text-slate-400" />
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Location</span>
          <span className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
            {displayLabel}
          </span>
        </div>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearchQuery(''); }} />
          
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-card-hover animate-slide-in">
            <div className="relative mb-2.5">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search city or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-700 outline-none focus:border-primary-400 focus:bg-white transition"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => handleSelect('all', '')}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Any Location</span>
                {valueCity === 'all' && valueState === 'all' && (
                  <Check className="h-3.5 w-3.5 text-primary-600" />
                )}
              </button>

              {filteredCities.length > 0 && (
                <div>
                  <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cities</p>
                  <div className="space-y-0.5">
                    {filteredCities.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelect('city', c)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 transition text-left"
                      >
                        <span>{c}</span>
                        {valueCity === c && (
                          <Check className="h-3.5 w-3.5 text-primary-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredStates.length > 0 && (
                <div>
                  <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1">States</p>
                  <div className="space-y-0.5">
                    {filteredStates.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSelect('state', s)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 transition text-left"
                      >
                        <span>{s}</span>
                        {valueState === s && (
                          <Check className="h-3.5 w-3.5 text-primary-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredCities.length === 0 && filteredStates.length === 0 && (
                <p className="px-2 py-3 text-center text-xs font-medium text-slate-400">
                  No matching locations
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const { addSavedSearch } = useSavedSearch()
  const { showToast } = useToast()
  const { properties } = useProperties()
  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties])

  const [city, setCity] = useState(searchParams.get('city') ?? 'all')
  const [state, setState] = useState('all')
  const [guests, setGuests] = useState(searchParams.get('guests') ?? 'all')
  const [budget, setBudget] = useState(Number(searchParams.get('budget')) || MAX_BUDGET)
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

  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => setIsSearching(false), 300)
    return () => clearTimeout(timer)
  }, [
    city,
    state,
    guests,
    budget,
    propertyType,
    amenities,
    stayDuration,
    verifiedOnly,
    freeCancellationOnly,
    instantBookOnly,
    guestFavouriteOnly,
    sort,
    collectionSlug,
  ])

  const collection = getQuickFilter(collectionSlug)

  // Tier A collections (see quickFilters.ts) get their own indexable
  // landing page — unique title/description and a self-referencing
  // canonical to /search?collection=<slug>. Everything else (plain
  // /search, Tier B collections, any other filter combination) canonicalizes
  // back to the bare /search page rather than competing for its own
  // indexed URL — see SITE-STRUCTURE.md.
  const isIndexableCollection = collection?.tier === 'A'
  usePageMeta(
    isIndexableCollection ? collection!.seoTitle! : 'Search Villas, Holiday Homes & Vacation Rentals',
    isIndexableCollection
      ? collection!.seoDescription!
      : 'Search verified villas, cabins, cottages, and farmhouses by destination, budget, guests, and amenities on innbly.',
    undefined,
    isIndexableCollection ? `/search?collection=${collection!.slug}` : '/search',
  )

  // Manually touching a filter after landing on a collection (e.g. "Under
  // ₹2000" from the homepage) should let that filter take over — otherwise
  // the collection's predicate keeps silently zeroing out results no matter
  // what the user changes it to.
  const withCollectionCleared = <T,>(setter: (v: T) => void) => (v: T) => {
    if (collectionSlug) setCollectionSlug(null)
    setter(v)
  }
  const setCityAndClear = withCollectionCleared(setCity)
  const setGuestsAndClear = withCollectionCleared(setGuests)
  const setBudgetAndClear = withCollectionCleared(setBudget)
  const setPropertyTypeAndClear = withCollectionCleared(setPropertyType)
  const setStayDurationAndClear = withCollectionCleared(setStayDuration)
  const toggleAmenityAndClear = withCollectionCleared(toggleAmenity)

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
    properties, city, state, guests, budget, propertyType, amenities, stayDuration,
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
    setPropertyType('all')
    setAmenities([])
    setStayDuration('all')
    setVerifiedOnly(false)
    setFreeCancellationOnly(false)
    setInstantBookOnly(false)
    setGuestFavouriteOnly(false)
    setCollectionSlug(null)
  }

  const filterControls = (stacked: boolean) => {
    const activeCount = amenities.length > 0 ? 1 : 0
    return (
      <div className={stacked ? 'flex flex-col gap-4' : 'flex flex-wrap items-center gap-2.5'}>
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }}
          customTrigger={
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-300 shadow-sm"
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Check-in — Check-out</span>
                <span className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                  {checkIn ? formatDisplay(checkIn) : 'Add dates'} — {checkOut ? formatDisplay(checkOut) : 'Add dates'}
                </span>
              </div>
            </button>
          }
        />
        <SearchableLocationFilter
          valueCity={city}
          valueState={state}
          onChange={(newCity, newState) => {
            if (collectionSlug) setCollectionSlug(null)
            setCity(newCity)
            setState(newState)
          }}
          properties={properties}
        />
        <SelectFilter
          label="Guests"
          value={guests}
          onChange={setGuestsAndClear}
          options={[
            { value: '1', label: '1 Guest' },
            { value: '2', label: '2 Guests' },
            { value: '4', label: '4 Guests' },
            { value: '6', label: '6+ Guests' },
          ]}
          icon={Users}
        />
        <SelectFilter
          label="Stay Length"
          value={stayDuration}
          onChange={setStayDurationAndClear}
          options={[
            { value: 'short', label: 'Short Stay (< 1 week)' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly+' },
          ]}
          icon={Calendar}
        />
        <BudgetSlider value={budget} onChange={setBudgetAndClear} />
        <MoreFiltersPopover
          amenities={amenities}
          amenityOptions={ALL_AMENITIES}
          onToggleAmenity={toggleAmenityAndClear}
        />
      </div>
    )
  }

  return (
    <section className="bg-slate-50/30 min-h-screen">
      <h1 className="sr-only">Search villas, holiday homes, cabins, cottages, and farmhouses</h1>

      {/* Sticky search & filter bar — stays fixed directly beneath the sticky brand header */}
      <div className="sticky top-20 z-30 space-y-3 border-b border-slate-100 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          {collection && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-1.5 text-xs font-bold text-primary-700">
              Showing: {collection.label}
            </div>
          )}
          <div className="mb-3 hidden sm:block">{filterControls(false)}</div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <PropertyTypeScroller active={propertyType} onChange={setPropertyType} />
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`flex h-8 px-2.5 items-center gap-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`flex h-8 px-2.5 items-center gap-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List className="h-4 w-4" /> List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Popular Filters sidebar — desktop only */}
        <aside className="hidden shrink-0 lg:block lg:w-64 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900">Filters</h2>
              <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:underline">
                Clear All
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Popular Filters</p>
              <div className="space-y-3">
                {[
                  { key: 'freeCancellation', label: 'Free Cancellation', checked: freeCancellationOnly, onChange: withCollectionCleared(setFreeCancellationOnly), count: popularFilterCounts.freeCancellation },
                  { key: 'instantBook', label: 'Instant Book', checked: instantBookOnly, onChange: withCollectionCleared(setInstantBookOnly), count: popularFilterCounts.instantBook },
                  { key: 'verified', label: 'Verified Properties', checked: verifiedOnly, onChange: withCollectionCleared(setVerifiedOnly), count: popularFilterCounts.verified },
                  { key: 'guestFavourite', label: 'Guest Favourite', checked: guestFavouriteOnly, onChange: withCollectionCleared(setGuestFavouriteOnly), count: popularFilterCounts.guestFavourite },
                ].map((f) => (
                  <label key={f.key} className="flex cursor-pointer items-center justify-between gap-2 text-xs text-slate-600 font-semibold hover:text-slate-900">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={f.checked}
                        onChange={(e) => f.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 accent-primary-600"
                      />
                      {f.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-105 px-2 py-0.5 rounded-full">{f.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Property Type</p>
              <select
                value={propertyType}
                onChange={(e) => setPropertyTypeAndClear(e.target.value as any)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500"
              >
                <option value="all">Select Type</option>
                <option value="Villas">Villas</option>
                <option value="Apartments">Apartments</option>
                <option value="Cabins">Cabins</option>
                <option value="Cottages">Cottages</option>
                <option value="Resorts">Resorts</option>
                <option value="Hotels">Hotels</option>
              </select>
            </div>

            {/* Amenities Dropdown */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Amenities</p>
              <select
                onChange={(e) => {
                  if (e.target.value !== 'all') {
                    toggleAmenityAndClear(e.target.value)
                  }
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500"
              >
                <option value="all">Select Amenities</option>
                {ALL_AMENITIES.map((a) => (
                  <option key={a} value={a}>{a} {amenities.includes(a) ? '✓' : ''}</option>
                ))}
              </select>
            </div>



            {/* Property Rules Dropdown */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Property Rules</p>
              <select
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500"
              >
                <option value="all">Select Rules</option>
                <option value="pets">Pets Allowed</option>
                <option value="smoking">Smoking Allowed</option>
                <option value="parties">Parties Allowed</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Sort By</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => showToast('Filters applied!')}
                className="w-full rounded-xl bg-gradient-to-r from-red-500 to-primary-600 py-3 text-xs font-bold text-white shadow-md hover:from-red-600 hover:to-primary-700 active:scale-95 transition"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleSaveSearch}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-205 bg-white py-3 text-xs font-bold text-slate-700 hover:border-slate-300 transition active:scale-95"
              >
                <Heart className="h-4 w-4 text-rose-500" /> Save Search
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:w-3/5">
          {/* Mockup matching stays metadata stats row */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-slate-900 font-extrabold text-xs">{filtered.length} stays found</span>
            <span>·</span>
            <span>Avg ₹4,300/night</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-primary-600 font-bold">
              <Zap className="h-3.5 w-3.5 fill-primary-600 text-primary-600" /> {filtered.filter(p => p.instantBook).length} Instant Book
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {filtered.filter(p => p.verified).length} Verified
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> {filtered.filter(p => p.rating >= 4.5).length} Guest Favourite
            </span>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2' : 'flex flex-col gap-4'}>
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.05}>
                  <PropertyCard property={p} onQuickView={setQuickViewProperty} />
                </Reveal>
              ))}
            </div>
          )}
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
