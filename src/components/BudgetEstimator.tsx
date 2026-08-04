import { useMemo, useState } from 'react'
import { Link } from '~links'
import { SlidersHorizontal, UtensilsCrossed, Snowflake, ShieldCheck, Receipt, Loader2, Calendar } from 'lucide-react'
import { useServerPrice } from '../hooks/useServerPrice'

type StayConfig = 'Villa' | 'Cottage' | 'Cabin'

const DISPLAY_PRICES: Record<StayConfig, number> = { Villa: 6500, Cottage: 5000, Cabin: 4000 }
const MEALS_PRICE_PER_NIGHT = 1500
const AC_PRICE_PER_NIGHT = 500

const configOptions: { key: StayConfig; label: string; icon: string }[] = [
  { key: 'Villa', label: 'Private Villa', icon: '🏡' },
  { key: 'Cottage', label: 'Cozy Cottage', icon: '🏡' },
  { key: 'Cabin', label: 'Mountain Cabin', icon: '🏔️' },
]

const durationOptions = [
  { label: 'Weekend (2 Nights)', value: 2 },
  { label: 'Short Break (3 Nights)', value: 3 },
  { label: 'Week Stay (7 Nights)', value: 7 },
]

interface EstimatorTotal {
  baseRent: number
  mealRent: number
  acRent: number
  totalMonthly: number
  securityDeposit: number
}

export function BudgetEstimator() {
  const [roomType, setRoomType] = useState<StayConfig>('Villa')
  const [nights, setNights] = useState<number>(2)
  const [meals, setMeals] = useState(false)
  const [ac, setAc] = useState(false)

  const request = useMemo(() => ({ kind: 'estimator', roomType, nights, meals, ac }), [roomType, nights, meals, ac])
  
  const fallback = useMemo<EstimatorTotal>(() => {
    const basePricePerNight = DISPLAY_PRICES[roomType]
    const baseRent = basePricePerNight * nights
    const mealRent = meals ? MEALS_PRICE_PER_NIGHT * nights : 0
    const acRent = ac ? AC_PRICE_PER_NIGHT * nights : 0
    const totalMonthly = baseRent + mealRent + acRent
    return { baseRent, mealRent, acRent, totalMonthly, securityDeposit: 5000 }
  }, [roomType, nights, meals, ac])

  const { data, loading, error } = useServerPrice<EstimatorTotal>({ request, fallback })
  const { baseRent, mealRent, acRent, totalMonthly, securityDeposit } = data

  return (
    <section id="estimator" className="border-y border-slate-100 bg-slate-50/70 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-accent-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-800">
            Instant Stay Planner
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Estimate Your Vacation Stays
          </h2>
          <p className="mt-4 font-medium leading-relaxed text-slate-500">
            No hidden pricing surprises. Select your property type, stay duration, and luxury add-ons to preview an instant price breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Config panel */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-card md:p-8 lg:col-span-7">
            <div className="space-y-8">
              <h3 className="flex items-center gap-2.5 border-b border-slate-100 pb-4 text-xl font-bold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                Configure Stay Preferences
              </h3>

              <div>
                <label className="mb-3.5 block text-sm font-bold text-slate-700">Select Stay Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {configOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setRoomType(opt.key)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition-all ${
                        roomType === opt.key
                          ? 'border-primary-500 bg-primary-50/50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="mt-1 text-xs font-semibold text-slate-500">
                        ₹{DISPLAY_PRICES[opt.key].toLocaleString('en-IN')}/night
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3.5 block text-sm font-bold text-slate-700">Stay Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNights(opt.value)}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all ${
                        nights === opt.value
                          ? 'border-primary-500 bg-primary-50/50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mb-1" />
                      <span className="text-xs font-bold text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
                      <UtensilsCrossed className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">Private Chef & Meals</p>
                      <p className="text-xs font-semibold text-slate-500">+ ₹{MEALS_PRICE_PER_NIGHT.toLocaleString('en-IN')}/night</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" checked={meals} onChange={() => setMeals((v) => !v)} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm">
                      <Snowflake className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">AC / Climate Upgrade</p>
                      <p className="text-xs font-semibold text-slate-500">+ ₹{AC_PRICE_PER_NIGHT.toLocaleString('en-IN')}/night</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" checked={ac} onChange={() => setAc((v) => !v)} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-accent-500" /> Refundable security deposits are handled securely and returned after checkout.
            </div>
          </div>

          {/* Receipt card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl shadow-slate-900/10 md:p-8 lg:col-span-5">
            <Receipt className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 translate-x-12 translate-y-12 text-white opacity-10" />

            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <h4 className="text-lg font-bold tracking-tight text-white">Your Stay Estimate</h4>
                  <p className="text-xs font-medium text-slate-400">Auto-calculating stay breakdown</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-lg border border-primary-500/20 bg-primary-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-400">
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />} Live Quote
                </span>
              </div>
              {error && <p className="mt-2 text-xs font-medium text-rose-400">Showing an estimate — pricing service unreachable.</p>}

              <div className="space-y-4 py-8">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">Base Stay Cost ({nights} Nights)</span>
                  <span className="font-bold tracking-wide">₹{baseRent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">Meals Add-on ({nights} Nights)</span>
                  <span className="font-bold tracking-wide">₹{mealRent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-4 text-sm">
                  <span className="font-semibold text-slate-300">AC Climate Upgrade ({nights} Nights)</span>
                  <span className="font-bold tracking-wide">₹{acRent.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-baseline justify-between pt-4">
                  <span className="text-base font-bold text-slate-200">Total Stay Price</span>
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    ₹{totalMonthly.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-xs">
                  <span className="font-semibold text-slate-400">Refundable Security Deposit</span>
                  <span className="font-bold tracking-wide text-accent-400">₹{securityDeposit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <Link
              to="/search"
              className="relative z-10 mt-6 flex w-full items-center justify-center rounded-2xl bg-accent-500 py-4 text-[15px] font-extrabold text-stone-950 shadow-lg transition-all hover:bg-accent-400 active:scale-[0.98]"
            >
              Browse Stays Like This
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
