import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, MapPin, MessageCircle } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from '../components/PropertyCard'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Find a stay that feels like <span className="text-primary-600">home</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Verified PGs, coliving spaces, and rentals — search, schedule a free visit, and chat with hosts instantly.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/search?q=${encodeURIComponent(query)}`)
            }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-card"
          >
            <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city or neighborhood"
              className="flex-1 border-none bg-transparent px-1 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5">
            <ShieldCheck className="h-8 w-8 shrink-0 text-accent-600" />
            <div>
              <h3 className="font-semibold text-slate-800">Verified listings</h3>
              <p className="text-sm text-slate-500">Every host is reviewed before going live.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5">
            <MapPin className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <h3 className="font-semibold text-slate-800">Prime locations</h3>
              <p className="text-sm text-slate-500">Stays close to metros, tech parks, and campuses.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5">
            <MessageCircle className="h-8 w-8 shrink-0 text-amber-500" />
            <div>
              <h3 className="font-semibold text-slate-800">Instant host chat</h3>
              <p className="text-sm text-slate-500">One-click WhatsApp connect with hosts.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Popular stays</h2>
          <button onClick={() => navigate('/search')} className="text-sm font-semibold text-primary-600 hover:underline">
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
