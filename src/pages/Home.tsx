import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, BedDouble, Wallet } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from '../components/PropertyCard'
import { BudgetEstimator } from '../components/BudgetEstimator'
import { Benefits } from '../components/Benefits'
import { Testimonials } from '../components/Testimonials'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

const cities = Array.from(new Set(properties.map((p) => p.city)))

type Category = 'all' | 'Sharing' | 'Single' | 'Verified'

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All Stays' },
  { key: 'Sharing', label: 'Co-Living Hubs' },
  { key: 'Single', label: 'Premium Homestays' },
  { key: 'Verified', label: 'Verified Only' },
]

export function HomePage() {
  usePageMeta(
    'innbly — Verified PGs, Coliving & Rentals',
    'Search verified PGs, coliving spaces, and rentals across India. Schedule a free visit and chat with hosts instantly on innbly.',
  )
  const navigate = useNavigate()
  const [city, setCity] = useState('all')
  const [roomType, setRoomType] = useState('all')
  const [budget, setBudget] = useState('any')
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city !== 'all') params.set('city', city)
    if (roomType !== 'all') params.set('roomType', roomType)
    if (budget !== 'any') params.set('budget', budget)
    navigate(`/search?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (activeCategory === 'Sharing') return p.roomType === 'Sharing'
      if (activeCategory === 'Single') return p.roomType === 'Single'
      if (activeCategory === 'Verified') return p.verified
      return true
    })
  }, [activeCategory])

  return (
    <div>
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
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
              Explore fully furnished, secure, and highly social co-living rooms and vacation homes across prime
              metropolitan tech hubs.
            </p>
          </div>

          {/* Search widget */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100 md:rounded-3xl">
            <form onSubmit={handleSearch} className="grid grid-cols-1 items-center gap-3 md:grid-cols-4">
              <div className="relative border-slate-100 px-3 py-2 md:border-r">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <MapPin className="mr-1 inline h-3 w-3 text-primary-500" /> Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-[15px] font-semibold text-slate-800 outline-none"
                >
                  <option value="all">Any Area / City</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative border-slate-100 px-3 py-2 md:border-r">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <BedDouble className="mr-1 inline h-3 w-3 text-primary-500" /> Room Configuration
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-[15px] font-semibold text-slate-800 outline-none"
                >
                  <option value="all">All Room Types</option>
                  <option value="Single">Single Room</option>
                  <option value="Sharing">Sharing</option>
                </select>
              </div>

              <div className="relative border-slate-100 px-3 py-2 md:border-r">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <Wallet className="mr-1 inline h-3 w-3 text-primary-500" /> Max Monthly Rent
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-[15px] font-semibold text-slate-800 outline-none"
                >
                  <option value="any">Any Budget</option>
                  <option value="12000">Under ₹12,000</option>
                  <option value="18000">Under ₹18,000</option>
                  <option value="25000">Under ₹25,000</option>
                </select>
              </div>

              <div className="px-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-4 font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-95 md:rounded-2xl"
                >
                  <Search className="h-4 w-4" /> Search Stays
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Discover */}
      <section id="discover" className="bg-white py-20">
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

      <BudgetEstimator />
      <Benefits />
      <Testimonials />
      <Footer />
    </div>
  )
}
