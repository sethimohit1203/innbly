import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, ArrowRight } from 'lucide-react'
import { properties } from '../data/properties'
import { PropertyCard } from './PropertyCard'

const BUDGET_OPTIONS = [
  { label: 'Under ₹1,200', value: '1200' },
  { label: 'Under ₹2,000', value: '2000' },
  { label: 'Under ₹3,500', value: '3500' },
  { label: 'No budget limit', value: 'any' },
]

const cities = Array.from(new Set(properties.map((p) => p.city)))

export function QuickMatchAssistant() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [budget, setBudget] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [guests, setGuests] = useState<string | null>(null)
  const [tenant, setTenant] = useState<string | null>(null)

  const matches = useMemo(() => {
    if (step < 4) return []
    return properties.filter((p) => {
      if (budget && budget !== 'any' && p.price > Number(budget)) return false
      if (city && p.city !== city) return false
      if (guests && p.maxGuests < Number(guests)) return false
      if (tenant && tenant !== 'Anyone' && p.tenantPreference !== tenant) return false
      return true
    })
  }, [step, budget, city, guests, tenant])

  const reset = () => {
    setStep(0)
    setBudget(null)
    setCity(null)
    setGuests(null)
    setTenant(null)
  }

  const seeAllResults = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (guests) params.set('guests', guests)
    if (budget && budget !== 'any') params.set('budget', budget)
    navigate(`/search?${params.toString()}`)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-black md:bottom-6 md:right-6"
      >
        <Sparkles className="h-4 w-4 text-accent-400" /> Quick Match
      </button>
    )
  }

  return (
    <div
      data-testid="quick-match-panel"
      className="fixed bottom-20 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl md:bottom-6 md:right-6"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-500" />
          <h3 className="text-sm font-extrabold text-slate-900">Quick Match</h3>
        </div>
        <button onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[26rem] overflow-y-auto p-4 scrollbar-thin">
        {step === 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">What's your budget per night?</p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setBudget(o.value); setStep(1) }}
                  className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Which city?</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setStep(2) }}
                  className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
                >
                  {c}
                </button>
              ))}
              <button
                onClick={() => { setCity(null); setStep(2) }}
                className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 transition hover:border-primary-400"
              >
                All cities
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">How many guests?</p>
            <div className="flex flex-wrap gap-2">
              {['1', '2', '4', '6'].map((g) => (
                <button
                  key={g}
                  onClick={() => { setGuests(g); setStep(3) }}
                  className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
                >
                  {g}{g === '6' ? '+' : ''} guest{g === '1' ? '' : 's'}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Preferred tenant type?</p>
            <div className="flex flex-wrap gap-2">
              {['Boys', 'Girls', 'Family', 'Anyone'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTenant(t); setStep(4) }}
                  className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{matches.length} matches found</p>
              <button onClick={reset} className="text-xs font-bold text-primary-600 hover:underline">
                Start over
              </button>
            </div>
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400">No exact matches — try widening your criteria.</p>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 2).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
            <button
              onClick={seeAllResults}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700"
            >
              See all results <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
