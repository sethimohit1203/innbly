import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from '~links'
import { motion } from 'framer-motion'
import { Search, MapPin, Users, Wallet, ChevronLeft, ChevronRight, BadgeIndianRupee, ShieldCheck, Users2, Headset, Home, CalendarDays, ArrowRight, AlertCircle } from 'lucide-react'
import { PropertyCard } from '../components/PropertyCard'
import { BudgetEstimator } from '../components/BudgetEstimator'
import { AIBudgetPlanner } from '../components/AIBudgetPlanner'
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
import { DateRangePicker, formatDisplay } from '../components/DateRangePicker'
import { LocationAutocomplete } from '../components/LocationAutocomplete'
import { StickyHomeSearchBar } from '../components/StickyHomeSearchBar'
import { BecomeHostCTA } from '../components/BecomeHostCTA'
import { FAQAccordion, DEFAULT_FAQS } from '../components/FAQAccordion'
import { Reveal } from '../components/Reveal'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useProperties } from '../context/PropertiesContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { faqSchema, webPageSchema } from '../lib/seo'
import { DESTINATIONS } from '../data/destinations'
import type { Property } from '../types'


const PROPERTY_TYPE_EXPLORE: { label: string; propertyType: string; image: string; subtitle: string }[] = [
  { label: 'Villas', propertyType: 'Villas', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Private villas with luxury & comfort' },
  { label: 'Apartments', propertyType: 'Apartments', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Modern apartments in prime locations' },
  { label: 'Cabins', propertyType: 'Cabins', image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Cozy cabins surrounded by nature' },
  { label: 'Cottages', propertyType: 'Cottages', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Charming cottages for peaceful getaways' },
  { label: 'Farmhouses', propertyType: 'Farm Stays', image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Spacious farmhouses for family & groups' },
  { label: 'Holiday Homes', propertyType: 'Holiday Homes', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Perfect homes for holidays' },
  { label: 'Luxury Homes', propertyType: 'Country Houses', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Premium stays for a luxurious life' },
  { label: 'Resorts', propertyType: 'Resorts', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&h=450&q=75&fm=webp', subtitle: 'Premium resort packages and suites' },
]

const FEATURE_STRIP = [
  { icon: BadgeIndianRupee, title: 'Best Price Guarantee', text: 'Get the best deals or we\'ll match it' },
  { icon: ShieldCheck, title: 'Free Cancellation', text: 'Cancel for free on selected properties' },
  { icon: Users2, title: 'Trusted by Millions', text: 'Join millions of happy travelers worldwide' },
  { icon: Headset, title: '24/7 Support', text: 'We\'re here to help anytime, anywhere' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Search', text: 'Enter your destination, dates, and guest count to see verified villas, cabins, cottages, and farmhouses available for those dates.' },
  { step: '2', title: 'Explore', text: 'Compare photos, amenities, nearby attractions, and host reviews across shortlisted properties before deciding.' },
  { step: '3', title: 'Book', text: 'Reserve instantly on eligible listings or message the host directly — pay securely with a full price breakdown shown upfront.' },
  { step: '4', title: 'Enjoy Your Stay', text: 'Check in, relax, and reach your host directly over WhatsApp for anything you need during the trip.' },
]

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
    'Verified Villas, Holiday Homes & Vacation Rentals in India',
    'Book verified villas, holiday homes, cabins, cottages and farmhouses across India\'s top getaway destinations. Transparent pricing, real hosts, instant booking.',
  )
  useJsonLd('home-schema', [
    webPageSchema({
      name: 'Verified Villas, Holiday Homes & Vacation Rentals in India | Innbly',
      description: 'Book verified villas, holiday homes, cabins, cottages and farmhouses across India\'s top getaway destinations on Innbly.',
      path: '/',
    }),
    faqSchema(DEFAULT_FAQS),
  ])
  const navigate = useNavigate()
  const { properties } = useProperties()
  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties])
  const { savedIds } = useSavedProperties()
  const { recentIds } = useRecentlyViewed()
  const [locationQuery, setLocationQuery] = useState('')
  const [guests, setGuests] = useState('all')
  const [budget, setBudget] = useState('any')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const topStaysRef = useRef<HTMLDivElement>(null)

  const scrollTopStays = (dir: 'left' | 'right') => {
    topStaysRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  const topStays = useMemo(() => [...properties].sort((a, b) => b.rating - a.rating).slice(0, 8), [properties])

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
  }, [activeCategory, properties])

  const recommended = useMemo(() => getRecommended(properties, savedIds, recentIds), [properties, savedIds, recentIds])

  return (
    <div>
      {/* Hero — premium layout: 2-column left heading + right search card */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/40 via-white to-white pb-20 pt-16 md:pt-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Column: Heading */}
          <div className="flex-1 max-w-xl text-left">
            <h1 className="mb-4 text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl md:text-6xl animate-fade-in">
              Find stays that <span className="text-primary-600">feel like home</span>
            </h1>
            <p className="text-base sm:text-lg font-semibold text-slate-500 max-w-md leading-relaxed animate-fade-in">
              Discover unique places to stay around the world.
            </p>
          </div>

          {/* Right Column: Search Card */}
          <div className="w-full lg:max-w-3xl bg-white rounded-[28px] border border-slate-100 p-4 shadow-xl hover:shadow-2xl transition duration-300 animate-slide-in relative z-20">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 w-full relative rounded-2xl px-5 py-2.5 transition hover:bg-slate-50 md:rounded-full flex flex-col items-start gap-1">
                <label htmlFor="home-search-location" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary-500" /> Where are you going?
                </label>
                <LocationAutocomplete value={locationQuery} onChange={setLocationQuery} placeholder="Search destinations" />
              </div>

              <div className="hidden md:block h-10 w-[1.5px] bg-slate-100" />

              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }}
                customTrigger={
                  <div className="flex-1 w-full grid grid-cols-2">
                    <div className="rounded-2xl px-5 py-2.5 transition hover:bg-slate-50 md:rounded-full flex flex-col items-start gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-primary-500" /> Check in
                      </span>
                      <span className="block text-sm font-bold text-slate-800">
                        {checkIn ? formatDisplay(checkIn) : 'Add dates'}
                      </span>
                    </div>
                    <div className="rounded-2xl px-5 py-2.5 transition hover:bg-slate-50 md:rounded-full flex flex-col items-start gap-1 md:border-l md:border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-primary-500" /> Check out
                      </span>
                      <span className="block text-sm font-bold text-slate-800">
                        {checkOut ? formatDisplay(checkOut) : 'Add dates'}
                      </span>
                    </div>
                  </div>
                }
              />

              <div className="hidden md:block h-10 w-[1.5px] bg-slate-100" />

              <div className="flex-1 w-full relative rounded-2xl px-5 py-2.5 transition hover:bg-slate-50 md:rounded-full flex flex-col items-start gap-1">
                <label htmlFor="home-search-guests" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary-500" /> Guests
                </label>
                <select
                  id="home-search-guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="all">Add guests</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6+ Guests</option>
                </select>
              </div>

              <button
                type="submit"
                aria-label="Search"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-95 md:mr-2"
              >
                <Search className="h-5 w-5 stroke-[2.5px]" />
              </button>
            </form>
          </div>
        </div>

        {/* BestPrice Guarantee, Trusted, 24/7 Support directly beneath Search Bar */}
        <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-bold text-slate-600 px-6">
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-primary-600 border border-rose-100">
              ✓
            </span>
            <span>Best Price Guarantee</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">• Cancel for free first month of</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-primary-600 border border-rose-100">
              ✓
            </span>
            <span>Trustworthy Millions</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">• Reliability guarantee worldwide</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-primary-600 border border-rose-100">
              ✓
            </span>
            <span>24/7 Support</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">• We are here to help anytime</span>
          </span>
        </div>

        <HeroQuickChips />
      </section>

      {/* Category nav */}
      <section className="border-b border-slate-100 bg-slate-50 pb-5 pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CategoryScroller />
        </div>
      </section>

      {/* Top Stays For You — horizontal carousel, handpicked by rating */}
      {topStays.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mb-6 flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">🔥 Top Stays For You</h2>
                  <span className="text-sm font-semibold text-slate-400 hidden sm:inline">Handpicked stays guests love</span>
                </div>
                <div className="flex items-center gap-4">
                  <Link to="/search" className="text-sm font-bold text-slate-800 hover:text-primary-600 flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="hidden items-center gap-2 sm:flex">
                    <button
                      onClick={() => scrollTopStays('left')}
                      aria-label="Scroll left"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => scrollTopStays('right')}
                      aria-label="Scroll right"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
            <div ref={topStaysRef} className="flex snap-x gap-5 overflow-x-auto pb-2 scrollbar-thin">
              {topStays.map((p) => (
                <div key={p.id} className="w-72 shrink-0 snap-start sm:w-80">
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="bg-slate-50/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Recommended For You</h2>
              <p className="mb-6 text-sm font-medium text-slate-500">Based on properties you've saved and viewed.</p>
            </Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discover */}
      <section id="discover" className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 flex flex-col justify-between md:flex-row md:items-end">
              <div>
                <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Discover Curated Properties
                </h2>
                <p className="font-medium text-slate-500">
                  Verified villas, homestays, and premium stays for every kind of trip.
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
          </Reveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <p className="text-lg font-bold text-slate-600">No stays match your specific filters</p>
              <p className="text-sm">Try selecting "All Stays".</p>
            </div>
          )}
        </div>
      </section>

      {/* Explore by property type */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">Explore By Property Type</h2>
              </div>
              <Link to="/search" className="text-sm font-bold text-slate-800 hover:text-primary-600 flex items-center gap-1">
                View all categories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mb-8 text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500" /> Every stay on Innbly falls into one of these categories — pick the kind of space that fits your trip.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PROPERTY_TYPE_EXPLORE.map((t) => {
                const count = properties.filter((p) => p.propertyType === t.propertyType).length
                return (
                  <button
                    key={t.label}
                    onClick={() => navigate(`/search?type=${encodeURIComponent(t.propertyType)}`)}
                    className="relative h-64 overflow-hidden rounded-3xl text-left transition hover:-translate-y-1 hover:shadow-lg group shadow-card"
                  >
                    <img src={t.image} alt={t.label} className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    
                    {/* White overlay content at the bottom */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 p-3 shadow-md backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                          <Home className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-sm font-bold text-slate-800">{t.label}</p>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 leading-normal line-clamp-2">{t.subtitle}</p>
                      <p className="mt-1.5 text-[11px] font-bold text-primary-600">{count}+ stays</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Trending Destinations</h2>
            <p className="mb-6 text-sm font-medium text-slate-500">Where guests are booking the most stays right now.</p>
            <TrendingDestinations />
          </Reveal>
        </div>
      </section>

      {/* Popular destinations — full directory, links to dedicated destination guides */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Popular Destinations</h2>
            <p className="mb-6 text-sm font-medium text-slate-500">
              Destination guides with best-time-to-visit advice, attractions, food, and featured stays.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {DESTINATIONS.map((d) => (
                <Link
                  key={d.slug}
                  to={`/${d.slug}`}
                  className="group relative h-32 overflow-hidden rounded-2xl shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <img src={d.heroImage} alt={d.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  <p className="absolute bottom-2 left-3 text-sm font-extrabold text-white">{d.name}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Collections</h2>
            <CollectionsGrid />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Explore by Lifestyle</h2>
            <LifestyleExplorer />
          </Reveal>
        </div>
      </section>

      <RecentlyViewedSection />

      <section className="bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <TrustStats />
          </Reveal>
        </div>
      </section>

      <AIBudgetPlanner />
      <BudgetEstimator />
      <Benefits />

      {/* How It Works */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
                Simple Process
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">How It Works</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-card">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-lg font-extrabold text-white">
                    {s.step}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <BecomeHostCTA />

      {/* About Innbly — plain-language business context for both readers and
          AI/search crawlers (see public/llms.txt for the same positioning
          aimed specifically at AI assistants). */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
              About Innbly
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              India's Verified Vacation Rental Marketplace
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-left leading-relaxed text-slate-600 sm:text-center">
              Innbly is a vacation rental and unique-stays marketplace built for travelers planning short getaways
              across India. Every listing on Innbly is a
              short-stay property: a private villa, a mountain cabin, a heritage haveli, or a working farmhouse,
              bookable by the night rather than by the month. Our team physically audits and photographs each
              property before it goes live, hosts set their own nightly pricing with no brokerage cut, and guests
              can message a host directly before booking. Innbly currently features stays across Goa, Manali,
              Shimla, Jaipur, Udaipur, Mussoorie, Coorg, Ooty, Rishikesh, and Lonavala, with new destinations added
              regularly as more verified hosts join the platform.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
                Questions
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
