import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from '~links'
import { motion } from 'framer-motion'
import { Search, MapPin, Users, Wallet } from 'lucide-react'
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
import { DateRangePicker } from '../components/DateRangePicker'
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

// Kept at 1280x720 (not 1920x1080) and preloaded (see index.html) — this is
// the page's LCP element. A CSS background-image is invisible to the
// browser's preload scanner (only discovered after CSSOM is built), so
// without the explicit <link rel="preload"> in index.html this image starts
// downloading late no matter how small it is. picsum.photos is a demo/
// placeholder image host — swap for a real, CDN-optimized (WebP/AVIF) hero
// photo before shipping to production; that alone will cut payload further.
const HERO_IMAGE = 'https://picsum.photos/seed/innbly-hero-villa/1280/720'

const PROPERTY_TYPE_EXPLORE: { label: string; propertyType: string; image: string }[] = [
  { label: 'Villas', propertyType: 'Villas', image: 'https://picsum.photos/seed/explore-villas/600/450' },
  { label: 'Apartments', propertyType: 'Apartments', image: 'https://picsum.photos/seed/explore-apartments/600/450' },
  { label: 'Cabins', propertyType: 'Cabins', image: 'https://picsum.photos/seed/explore-cabins/600/450' },
  { label: 'Cottages', propertyType: 'Cottages', image: 'https://picsum.photos/seed/explore-cottages/600/450' },
  { label: 'Farmhouses', propertyType: 'Farm Stays', image: 'https://picsum.photos/seed/explore-farmhouses/600/450' },
  { label: 'Holiday Homes', propertyType: 'Holiday Homes', image: 'https://picsum.photos/seed/explore-holiday-homes/600/450' },
  { label: 'Luxury Homes', propertyType: 'Country Houses', image: 'https://picsum.photos/seed/explore-luxury/600/450' },
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
      <StickyHomeSearchBar onSearchClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-slate-900 bg-cover bg-center pb-32 pt-28 text-white sm:pb-40 md:pt-32"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.75), rgba(2,6,23,0.55) 45%, rgba(2,6,23,0.85)), url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-slate-50" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-300 backdrop-blur-md">
              ★ India's Verified Vacation Rental Network
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Verified Villas, Holiday Homes <br />
              <span className="bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
                & Vacation Rentals in India.
              </span>
            </h1>
            <p className="mx-auto mb-2 max-w-2xl text-lg font-medium leading-relaxed text-slate-200">
              Book fully furnished, verified villas, cabins, cottages, and farmhouses across India's most-loved
              getaway destinations — transparent pricing, real hosts, no brokerage.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroQuickChips />
          </motion.div>
        </div>
      </section>

      {/* Search widget — glass card floating over the hero/content boundary */}
      <div className="relative z-10 mx-auto -mt-24 max-w-5xl px-4 sm:-mt-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-2xl shadow-slate-900/20 backdrop-blur-xl md:rounded-3xl"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 items-center gap-3 md:grid-cols-5">
            <div className="relative border-slate-100 px-3 py-2 md:border-r">
              <label htmlFor="home-search-location" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="mr-1 inline h-3 w-3 text-primary-500" /> Location
              </label>
              <LocationAutocomplete value={locationQuery} onChange={setLocationQuery} placeholder="Area / City" />
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
                <option value="all">Number of Guests</option>
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
                <option value="any">Budget</option>
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
        </motion.div>
      </div>

      {/* Category nav */}
      <section className="border-b border-slate-100 bg-slate-50 pb-5 pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CategoryScroller />
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="bg-white py-16">
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
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Explore By Property Type</h2>
            <p className="mb-6 text-sm font-medium text-slate-500">
              Every stay on Innbly falls into one of these categories — pick the kind of space that fits your trip.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
              {PROPERTY_TYPE_EXPLORE.map((t) => (
                <button
                  key={t.label}
                  onClick={() => navigate(`/search?type=${encodeURIComponent(t.propertyType)}`)}
                  className="group overflow-hidden rounded-2xl border border-slate-100 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="h-24 w-full overflow-hidden">
                    <img src={t.image} alt={t.label} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <p className="px-3 py-2 text-sm font-bold text-slate-800">{t.label}</p>
                </button>
              ))}
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
              {DESTINATIONS.filter((d) => d.slug !== 'lonavala').map((d) => (
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
              across India — not a long-term rental, PG, or coliving platform. Every listing on Innbly is a
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
