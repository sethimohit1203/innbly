import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, ArrowRight } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from './PropertyCard'

const NIGHT_OPTIONS = [2, 4, 7, 14]
const GUEST_OPTIONS = [1, 2, 4, 6]

export function AIBudgetPlanner() {
  const navigate = useNavigate()
  const [totalBudget, setTotalBudget] = useState(15000)
  const [nights, setNights] = useState(4)
  const [guests, setGuests] = useState(2)

  const perNightBudget = Math.floor(totalBudget / nights)

  const matches = useMemo(() => {
    return properties
      .filter((p) => p.price <= perNightBudget && p.maxGuests >= guests)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
  }, [perNightBudget, guests])

  const seeAllResults = () => {
    const params = new URLSearchParams()
    params.set('budget', String(perNightBudget))
    params.set('guests', String(guests))
    navigate(`/search?${params.toString()}`)
  }

  return (
    <section className="border-y border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            Rule-Based Trip Planner
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Plan Your Trip Budget
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            Tell us your total trip budget, stay length, and group size — we'll work out a nightly budget and
            surface matching stays from our catalog. This is a simple rules-based calculator, not an AI model.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 shadow-card md:p-8 lg:col-span-5">
            <div className="mb-6 flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
                <Wand2 className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Your Trip Details</h3>
            </div>

            <label htmlFor="planner-budget" className="mb-1.5 block text-sm font-bold text-slate-700">
              Total Trip Budget (₹)
            </label>
            <input
              id="planner-budget"
              type="range"
              min={2000}
              max={60000}
              step={1000}
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="mb-1 w-full accent-primary-600"
            />
            <p className="mb-5 text-sm font-semibold text-primary-700">₹{totalBudget.toLocaleString('en-IN')}</p>

            <label className="mb-1.5 block text-sm font-bold text-slate-700">Number of Nights</label>
            <div className="mb-5 flex flex-wrap gap-2">
              {NIGHT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNights(n)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                    nights === n
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-primary-400'
                  }`}
                >
                  {n} nights
                </button>
              ))}
            </div>

            <label className="mb-1.5 block text-sm font-bold text-slate-700">Guests</label>
            <div className="flex flex-wrap gap-2">
              {GUEST_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGuests(g)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                    guests === g
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-primary-400'
                  }`}
                >
                  {g}{g === 6 ? '+' : ''} guest{g === 1 ? '' : 's'}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-stone-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested Nightly Budget</p>
              <p className="mt-1 text-2xl font-extrabold">₹{perNightBudget.toLocaleString('en-IN')}/night</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Matching Stays</h3>
              <span className="text-sm font-semibold text-slate-500">{matches.length} found</span>
            </div>
            {matches.length === 0 ? (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                <p className="font-bold text-slate-600">No stays fit that nightly budget yet</p>
                <p className="mt-1 text-sm text-slate-400">Try increasing your budget or reducing nights/guests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {matches.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
            <button
              onClick={seeAllResults}
              className="mt-6 flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
            >
              See all matching results <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
