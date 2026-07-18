import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Users, Wallet } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from '../components/PropertyCard'
import { BudgetEstimator } from '../components/BudgetEstimator'
import { Benefits } from '../components/Benefits'
import { Testimonials } from '../components/Testimonials'
import { Footer } from '../components/Footer'
import { HeroQuickChips } from '../components/HeroQuickChips'
import { CategoryScroller } from '../components/CategoryScroller'
import { TrendingDestinations } from '../components/TrendingDestinations'
import { CollectionsGrid } from '../components/CollectionsGrid'
import { LifestyleExplorer } from '../components/LifestyleExplorer'
import { TrustStats } from '../components/TrustStats'
import { RecentlyViewedSection } from '../components/RecentlyViewedSection'
import { DateRangePicker } from '../components/DateRangePicker'
import { LocationAutocomplete } from '../components/LocationAutocomplete'
import { StickyHomeSearchBar } from '../components/StickyHomeSearchBar'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Property } from '../types'

const cities = Array.from(new Set(properties.map((p) => p.city)))

type Category = 'all' | 'Solo' | 'Group' | 'Verified'

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All Stays' },
  { key: 'Solo', label: 'Solo Stays' },
  { key: 'Group', label: 'Family & Group Stays' },
  { key: 'Verified', label: 'Verified Only' },
]

function getRecommended(all: Property[], savedIds: string[], recentIds: string[]): Property[] {
  const historyIds = [...savedIds, ...recentIds]
  if (historyIds.length === 0) return []

  const history = historyIds.map((id) => all.find((p) => p.id === id)).filter((p): p is Property => Boolean(p))
  const cityCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  history.forEach((p) => {
    cityCounts.set(p.city, (cityCounts.get(p.city) ?? 0) + 1)
    typeCounts.set(p.propertyType, (typeCounts.get(p.propertyType) ?? 0) + 1)
  })
  const topCity = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const topType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  return all
    .filter((p) => !historyIds.includes(p.id))
    .map((p) => ({ p, score: (p.city === topCity ? 2 : 0) + (p.propertyType === topType ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .map((x) => x.p)
    .slice(0, 4)
}

export function HomePage() {
  usePageMeta(
    'innbly — Verified PGs, Coliving & Rentals',
    'Search verified PGs, coliving spaces, and rentals across India. Schedule a free visit and chat with hosts instantly on innbly.',
  )
  const navigate = useNavigate()
  const { savedIds } = useSavedProperties()
  const { recentIds } = useRecentlyViewed()
  const [locationQuery, setLocationQuery] = useState('')
  const [guests, setGuests] = useState('all')
  const [budget, setBudget] = useState('any')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    const trimmed = locationQuery.trim()
    if (trimmed) {
      const exactCity = cities.find((c) => c.toLowerCase() === trimmed.toLowerCase())
      if (exactCity) params.set('city', exactCity)
      else params.set('q', trimmed)
    }
    if (guests !== 'all') params.set('guests', guests)
    if (budget !== 'any') params.set('budget', budget)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    navigate(`/search?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (activeCategory === 'Solo') return p.maxGuests === 1
      if (activeCategory === 'Group') return p.maxGuests >= 4
      if (activeCategory === 'Verified') return p.verified
      return true
    })
  }, [activeCategory])

  const recommended = useMemo(() => getRecommended(properties, savedIds, recentIds), [savedIds, recentIds])

  return (
    <div>
      <StickyHomeSearchBar onSearchClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute right-[-10%] top-20 -z-10 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-[-10%] -z-10 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
              ★ India's Premium Co-Living Network
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Find Your Perfect Space. <br />
              <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Feels Just Like Home.
              </span>
            </h1>
            <p className="mx-auto mb-2 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
              Explore fully furnished, secure, and highly social co-living rooms and vacation homes across prime
              metropolitan tech hubs.
            </p>
          </div>

          <HeroQuickChips />

          {/* Search widget */}
          <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100 md:rounded-3xl">
            <form onSubmit={handleSearch} className="grid grid-cols-1 items-center gap-3 md:grid-cols-5">
              <div className="relative border-slate-100 px-3 py-2 md:border-r">
                <label htmlFor="home-search-location" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <MapPin className="mr-1 inline h-3 w-3 text-primary-500" /> Location
                </label>
                <LocationAutocomplete value={locationQuery} onChange={setLocationQuery} placeholder="Any Area / City" />
              </div>

              <div className="border-slate-100 px-1 py-1 md:border-r">
                <span className="mb-1 block px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Move-in Dates</span>
                <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }} />
              </div>

              <div className="relative border-slate-100 px-3 py-2 md:border-r">
                <label htmlFor="home-search-guests" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <Users className="mr-1 inline h-3 w-3 text-primary-500" /> Guests
                </label>
                <select
                  id="home-search-guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-[15px] font-semibold text-slate-800 outline-none"
                >
                  <option value="all">Any Number of Guests</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6+ Guests</option>
                </select>
              </div>

              <div className="relative border-slate-100 px-3 py-2 md:border-r">
                <label htmlFor="home-search-budget" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <Wallet className="mr-1 inline h-3 w-3 text-primary-500" /> Max Nightly Rate
                </label>
                <select
                  id="home-search-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-[15px] font-semibold text-slate-800 outline-none"
                >
                  <option value="any">Any Budget</option>
                  <option value="1200">Under ₹1,200</option>
                  <option value="2000">Under ₹2,000</option>
                  <option value="3500">Under ₹3,500</option>
                </select>
              </div>

              <div className="px-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-4 font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-95 md:rounded-2xl"
                >
                  <Search className="h-4 w-4" /> Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Category nav */}
      <section className="border-b border-slate-100 bg-white py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CategoryScroller />
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Recommended For You</h2>
            <p className="mb-6 text-sm font-medium text-slate-500">Based on properties you've saved and viewed.</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discover */}
      <section id="discover" className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between md:flex-row md:items-end">
            <div>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Discover Curated Properties
              </h2>
              <p className="font-medium text-slate-500">
                Verified homestays and premium student/executive co-living setups.
              </p>
            </div>
            <div className="mt-6 flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin sm:pb-0 md:mt-0">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold transition-all ${
                    activeCategory === c.key
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <p className="text-lg font-bold text-slate-600">No rooms match your specific filters</p>
              <p className="text-sm">Try selecting "All Stays".</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Trending Destinations</h2>
          <TrendingDestinations />
        </div>
      </section>

      <section className="bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Collections</h2>
          <CollectionsGrid />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Explore by Lifestyle</h2>
          <LifestyleExplorer />
        </div>
      </section>

      <RecentlyViewedSection />

      <section className="bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustStats />
        </div>
      </section>

      <BudgetEstimator />
      <Benefits />
      <Testimonials />
      <Footer />
    </div>
  )
}
