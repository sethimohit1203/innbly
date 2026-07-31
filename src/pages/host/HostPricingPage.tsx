import { useMemo, useState } from 'react'
import { KeyRound, ChevronLeft, ChevronRight, Loader2, Sparkles, Home, IndianRupee, Tag, CalendarClock, ShieldCheck } from 'lucide-react'
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
  discountNewListing: boolean
  discountLastMinute: boolean
  discountWeekly: boolean
  discountMonthly: boolean
  minNights: number
  maxNights: number
  cancellationPolicy: 'flexible' | 'firm'
  nonRefundableDiscountEnabled: boolean
}

interface DateOverride {
  date: string
  nightlyRate: number
}

type Panel = 'summary' | 'pricing' | 'discounts' | 'availability' | 'cancellations'

/** Fetch wrapper that always carries the verified id+code pair — kept in
 * this component's state only (never localStorage), so the host re-proves
 * ownership each time they open this page. */
async function callApi(id: string, code: string, init?: RequestInit) {
  const res = await fetch(`/api/host/listing-pricing?id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`, init)
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export function HostPricingPage() {
  usePageMeta('Pricing & Calendar', 'Set your base price, weekend rates, smart pricing, fees, discounts, availability and cancellation policy.')
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
  const [panel, setPanel] = useState<Panel>('summary')
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
    setPanel('summary')
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
      <div className="mx-auto max-w-sm animate-fade-in">
        <button onClick={() => selectListing('')} className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-slate-700">
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
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm tracking-widest outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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

  const weekendPrice = Math.round(listing.pricePerNight * (1 + listing.weekendAdjustmentPct))
  const enabledDiscounts = [
    listing.discountNewListing && 'New listing',
    listing.discountLastMinute && 'Last-minute',
    listing.discountWeekly && 'Weekly',
    listing.discountMonthly && 'Monthly',
  ].filter(Boolean) as string[]

  return (
    <div className="animate-fade-in">
      <button onClick={() => selectListing('')} className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-slate-700">
        ← Back to listings
      </button>
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">{listing.propertyTitle}</h2>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar — stays put regardless of which sidebar panel is open, matching Airbnb's layout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonthCursor(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() - 1, 1)))}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-bold text-slate-900">
              {monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </p>
            <button
              onClick={() => setMonthCursor(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 1)))}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
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
            <div className="mt-4 animate-fade-in rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Set price for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={overrideInput}
                  onChange={(e) => setOverrideInput(e.target.value)}
                  className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  onClick={() => saveDateOverride(selectedDate, Number(overrideInput))}
                  disabled={saving || !(Number(overrideInput) > 0)}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save
                </button>
                {overrideMap.has(selectedDate) && (
                  <button
                    onClick={() => saveDateOverride(selectedDate, null)}
                    disabled={saving}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                  >
                    Clear override
                  </button>
                )}
                <button onClick={() => setSelectedDate(null)} className="text-xs font-semibold text-slate-400 transition hover:text-slate-600">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — Airbnb-style summary rows that expand into detail panels */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          {panel === 'summary' && (
            <div className="animate-fade-in divide-y divide-slate-100">
              <SummaryRow
                icon={IndianRupee}
                title="Pricing"
                detail={`₹${listing.pricePerNight.toLocaleString('en-IN')} – ₹${weekendPrice.toLocaleString('en-IN')} per night`}
                onClick={() => setPanel('pricing')}
              />
              <SummaryRow
                icon={Tag}
                title="Discounts"
                detail={enabledDiscounts.length ? enabledDiscounts.join(', ') : 'None active'}
                onClick={() => setPanel('discounts')}
              />
              <SummaryRow
                icon={CalendarClock}
                title="Availability"
                detail={`${listing.minNights}–${listing.maxNights} night stays`}
                onClick={() => setPanel('availability')}
              />
              <SummaryRow
                icon={ShieldCheck}
                title="Cancellations"
                detail={listing.cancellationPolicy === 'firm' ? 'Firm' : 'Flexible'}
                onClick={() => setPanel('cancellations')}
              />
            </div>
          )}

          {panel === 'pricing' && (
            <div className="animate-fade-in">
              <PanelHeader title="Pricing" onBack={() => setPanel('summary')} />
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Base price (₹/night)</label>
                  <input
                    type="number"
                    value={listing.pricePerNight}
                    onChange={(e) => setListing({ ...listing, pricePerNight: Number(e.target.value) })}
                    onBlur={(e) => savePricing({ pricePerNight: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-lg font-bold outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Weekend adjustment (%)</label>
                  <input
                    type="number"
                    value={Math.round(listing.weekendAdjustmentPct * 100)}
                    onChange={(e) => setListing({ ...listing, weekendAdjustmentPct: Number(e.target.value) / 100 })}
                    onBlur={(e) => savePricing({ weekendAdjustmentPct: Number(e.target.value) / 100 })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  <p className="mt-1 text-xs text-slate-400">Applied Fri &amp; Sat. ₹{weekendPrice.toLocaleString('en-IN')}/night on weekends.</p>
                </div>

                <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3">
                  <input
                    type="checkbox"
                    checked={listing.smartPricingEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked
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
                    Sets a starter +15% weekend markup you can fine-tune above — not a live demand model.
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
                          className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {panel === 'discounts' && (
            <div className="animate-fade-in">
              <PanelHeader title="Discounts" onBack={() => setPanel('summary')} />
              <p className="mb-3 text-xs text-slate-400">These apply to all nights, unless customised by date.</p>
              <div className="space-y-3">
                {(
                  [
                    ['discountNewListing', '20%', 'New listing promotion', 'Available until your listing has 3 reviews or gets booked 10 times'],
                    ['discountLastMinute', '1%', 'Last-minute discount', 'For stays booked 14 days or less before arrival'],
                    ['discountWeekly', '10%', 'Weekly discount', 'For stays of 7 nights or more'],
                    ['discountMonthly', '15%', 'Monthly discount', 'For stays of 28 nights or more'],
                  ] as const
                ).map(([key, pct, label, hint]) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 min-w-[3rem] items-center justify-center rounded-full border border-slate-300 px-2 text-xs font-bold text-slate-700">{pct}</span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">{label}</span>
                        <span className="block text-xs text-slate-500">{hint}</span>
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={listing[key]}
                      onChange={(e) => {
                        setListing({ ...listing, [key]: e.target.checked })
                        savePricing({ [key]: e.target.checked } as Partial<ListingPricing>)
                      }}
                      className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                    />
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">Only one discount is applied per stay.</p>
            </div>
          )}

          {panel === 'availability' && (
            <div className="animate-fade-in">
              <PanelHeader title="Availability" onBack={() => setPanel('summary')} />
              <p className="mb-3 text-xs text-slate-400">These apply to all nights, unless customised by date.</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Minimum nights</label>
                  <input
                    type="number"
                    value={listing.minNights}
                    onChange={(e) => setListing({ ...listing, minNights: Number(e.target.value) })}
                    onBlur={(e) => savePricing({ minNights: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Maximum nights</label>
                  <input
                    type="number"
                    value={listing.maxNights}
                    onChange={(e) => setListing({ ...listing, maxNights: Number(e.target.value) })}
                    onBlur={(e) => savePricing({ maxNights: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Shown on your listing page. Advance-notice rules and external calendar sync aren't available yet.
                </p>
              </div>
            </div>
          )}

          {panel === 'cancellations' && (
            <div className="animate-fade-in">
              <PanelHeader title="Cancellations" onBack={() => setPanel('summary')} />
              <p className="mb-3 text-xs text-slate-400">These apply to all nights, unless customised by date.</p>
              <div className="space-y-3">
                <button
                  onClick={() => { setListing({ ...listing, cancellationPolicy: 'flexible' }); savePricing({ cancellationPolicy: 'flexible' }) }}
                  className={`block w-full rounded-xl border-2 p-3 text-left transition ${listing.cancellationPolicy === 'flexible' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className="text-sm font-semibold text-slate-800">Flexible</p>
                  <p className="text-xs text-slate-500">Free cancellation before check-in.</p>
                </button>
                <button
                  onClick={() => { setListing({ ...listing, cancellationPolicy: 'firm' }); savePricing({ cancellationPolicy: 'firm' }) }}
                  className={`block w-full rounded-xl border-2 p-3 text-left transition ${listing.cancellationPolicy === 'firm' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className="text-sm font-semibold text-slate-800">Firm</p>
                  <p className="text-xs text-slate-500">Less flexible for guests, better protection for you on last-minute cancellations.</p>
                </button>
              </div>

              <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Non-refundable option</span>
                  <span className="block text-xs text-slate-500">Offer guests a discount to book non-refundable.</span>
                </span>
                <input
                  type="checkbox"
                  checked={listing.nonRefundableDiscountEnabled}
                  onChange={(e) => {
                    setListing({ ...listing, nonRefundableDiscountEnabled: e.target.checked })
                    savePricing({ nonRefundableDiscountEnabled: e.target.checked })
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                />
              </label>
              <p className="mt-3 text-xs text-slate-400">
                This sets your listed policy. Cancellation handling in checkout still follows innbly's site-wide flow for now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ icon: Icon, title, detail, onClick }: { icon: typeof IndianRupee; title: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 py-3.5 text-left transition first:pt-0 last:pb-0 hover:opacity-70">
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-800">{title}</span>
          <span className="block text-xs text-slate-500">{detail}</span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </button>
  )
}

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <button onClick={onBack} className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <h3 className="font-bold text-slate-900">{title}</h3>
    </div>
  )
}
