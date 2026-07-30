import { useMemo, useState } from 'react'
import { KeyRound, ChevronLeft, ChevronRight, Loader2, Sparkles, Home } from 'lucide-react'
import { useProperties } from '../../context/PropertiesContext'
import { getMyListingIds } from '../../lib/myListings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { dateKey, resolvePrice, buildMonthDays } from '../../lib/pricingCalendar'

interface ListingPricing {
  id: string
  propertyTitle: string
  pricePerNight: number
  weekendAdjustmentPct: number
  smartPricingEnabled: boolean
  cleaningFee: number
  petFee: number
  extraGuestFee: number
}

interface DateOverride {
  date: string
  nightlyRate: number
}

/** Fetch wrapper that always carries the verified id+code pair — kept in
 * this component's state only (never localStorage), so the host re-proves
 * ownership each time they open this page. */
async function callApi(id: string, code: string, init?: RequestInit) {
  const res = await fetch(`/api/host/listing-pricing?id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`, init)
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export function HostPricingPage() {
  usePageMeta('Pricing & Calendar', 'Set your base price, weekend rates, smart pricing, fees, and manage your listing calendar.')
  const { properties } = useProperties()

  const myListingIds = getMyListingIds()
  const myListings = properties.filter((p) => p.id.startsWith('host-') && myListingIds.includes(p.id.replace('host-', '')))

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [listing, setListing] = useState<ListingPricing | null>(null)
  const [overrides, setOverrides] = useState<DateOverride[]>([])
  const [saving, setSaving] = useState(false)
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date()
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [overrideInput, setOverrideInput] = useState('')

  const overrideMap = useMemo(() => new Map(overrides.map((o) => [o.date, o.nightlyRate])), [overrides])

  const selectListing = (rawId: string) => {
    setSelectedId(rawId)
    setCode('')
    setAuthError(null)
    setListing(null)
    setSelectedDate(null)
  }

  const unlock = async () => {
    if (!selectedId || !code.trim()) return
    setVerifying(true)
    setAuthError(null)
    try {
      const { ok, data } = await callApi(selectedId, code.trim())
      if (!ok) {
        setAuthError(data.error ?? 'Incorrect access code.')
        return
      }
      setListing(data.listing)
      setOverrides(data.dateOverrides ?? [])
    } catch {
      setAuthError('Could not reach the server. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const savePricing = async (patch: Partial<Omit<ListingPricing, 'id' | 'propertyTitle'>>) => {
    if (!selectedId || !listing) return
    const previous = listing
    setListing({ ...listing, ...patch })
    setSaving(true)
    try {
      const { ok } = await callApi(selectedId, code, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricing: patch }),
      })
      if (!ok) setListing(previous)
    } catch {
      setListing(previous)
    } finally {
      setSaving(false)
    }
  }

  const saveDateOverride = async (date: string, nightlyRate: number | null) => {
    if (!selectedId) return
    setSaving(true)
    try {
      const body = nightlyRate === null ? { clearOverrides: [date] } : { setOverrides: [{ date, nightlyRate }] }
      const { ok } = await callApi(selectedId, code, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (ok) {
        setOverrides((prev) => {
          const rest = prev.filter((o) => o.date !== date)
          return nightlyRate === null ? rest : [...rest, { date, nightlyRate }]
        })
        setSelectedDate(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const monthDays = useMemo(() => buildMonthDays(monthCursor), [monthCursor])

  if (!selectedId) {
    return (
      <div>
        <h2 className="mb-1 text-lg font-bold text-slate-900">Pricing & Calendar</h2>
        <p className="mb-6 text-sm text-slate-500">Pick a listing to manage its price, weekend rates, fees, and calendar.</p>

        {myListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            <p className="font-semibold text-slate-600">No live listings yet.</p>
            <p className="mt-1 text-sm">Once a listing is approved, it'll show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {myListings.map((p) => {
              const rawId = p.id.replace('host-', '')
              return (
                <button
                  key={p.id}
                  onClick={() => selectListing(rawId)}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card transition hover:shadow-card-hover"
                >
                  <img src={p.images[0]} className="h-16 w-20 rounded-xl object-cover" alt={p.title} />
                  <div>
                    <p className="font-semibold text-slate-800">{p.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">₹{p.price.toLocaleString('en-IN')}/night</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-sm">
        <button onClick={() => selectListing('')} className="mb-4 text-sm font-semibold text-slate-500 hover:text-slate-700">
          ← Back to listings
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
            <KeyRound className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="mt-3 font-bold text-slate-900">Enter your access code</h3>
          <p className="mt-1 text-sm text-slate-500">
            The code you saved when you submitted this listing — check your confirmation email if you lost it.
          </p>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
            placeholder="Access code"
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm tracking-widest outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          {authError && <p className="mt-2 text-xs font-medium text-rose-600">{authError}</p>}
          <button
            onClick={unlock}
            disabled={verifying || !code.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying && <Loader2 className="h-4 w-4 animate-spin" />} Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => selectListing('')} className="mb-4 text-sm font-semibold text-slate-500 hover:text-slate-700">
        ← Back to listings
      </button>
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">{listing.propertyTitle}</h2>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Pricing settings */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Base price (₹/night)</label>
            <input
              type="number"
              value={listing.pricePerNight}
              onChange={(e) => setListing({ ...listing, pricePerNight: Number(e.target.value) })}
              onBlur={(e) => savePricing({ pricePerNight: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Weekend adjustment (%)</label>
            <input
              type="number"
              value={Math.round(listing.weekendAdjustmentPct * 100)}
              onChange={(e) => setListing({ ...listing, weekendAdjustmentPct: Number(e.target.value) / 100 })}
              onBlur={(e) => savePricing({ weekendAdjustmentPct: Number(e.target.value) / 100 })}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              Applied to Fri &amp; Sat nights. ₹{Math.round(listing.pricePerNight * (1 + listing.weekendAdjustmentPct)).toLocaleString('en-IN')}/night on weekends.
            </p>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={listing.smartPricingEnabled}
              onChange={(e) => {
                const enabled = e.target.checked
                // Honest behavior: this sets a starter weekend markup you can
                // still see and fine-tune above — it is not a live
                // demand-based pricing engine.
                const patch: Partial<ListingPricing> = { smartPricingEnabled: enabled }
                if (enabled && listing.weekendAdjustmentPct === 0) patch.weekendAdjustmentPct = 0.15
                setListing({ ...listing, ...patch })
                savePricing(patch)
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
            />
            <span className="text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" /> Smart pricing
              </span>
              Sets a starter +15% weekend markup for you — a sensible default you can fine-tune above, not an
              automated demand model.
            </span>
          </label>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Fees</p>
            <div className="space-y-3">
              {(
                [
                  ['cleaningFee', 'Cleaning fee (per stay)'],
                  ['petFee', 'Pet fee (per stay)'],
                  ['extraGuestFee', 'Extra guest fee (per night)'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
                  <input
                    type="number"
                    value={listing[key]}
                    onChange={(e) => setListing({ ...listing, [key]: Number(e.target.value) })}
                    onBlur={(e) => savePricing({ [key]: Number(e.target.value) } as Partial<ListingPricing>)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonthCursor(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() - 1, 1)))}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-bold text-slate-900">
              {monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </p>
            <button
              onClick={() => setMonthCursor(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 1)))}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {monthDays.map((d, i) => {
              if (!d) return <div key={`blank-${i}`} />
              const key = dateKey(d)
              const price = resolvePrice(listing, d, overrideMap)
              const isOverridden = overrideMap.has(key)
              const isPast = d < new Date(new Date().toDateString())
              return (
                <button
                  key={key}
                  disabled={isPast}
                  onClick={() => {
                    setSelectedDate(key)
                    setOverrideInput(String(price))
                  }}
                  className={`rounded-xl border p-1.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    selectedDate === key
                      ? 'border-primary-500 bg-primary-50'
                      : isOverridden
                        ? 'border-accent-300 bg-accent-50 hover:border-accent-400'
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-700">{d.getUTCDate()}</p>
                  <p className="text-[11px] text-slate-500">₹{price.toLocaleString('en-IN')}</p>
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Set price for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={overrideInput}
                  onChange={(e) => setOverrideInput(e.target.value)}
                  className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  onClick={() => saveDateOverride(selectedDate, Number(overrideInput))}
                  disabled={saving || !(Number(overrideInput) > 0)}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save
                </button>
                {overrideMap.has(selectedDate) && (
                  <button
                    onClick={() => saveDateOverride(selectedDate, null)}
                    disabled={saving}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Clear override
                  </button>
                )}
                <button onClick={() => setSelectedDate(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
