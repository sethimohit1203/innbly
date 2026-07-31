import { useEffect, useMemo, useState } from 'react'
import { Home, Check, X, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, IndianRupee } from 'lucide-react'
import { useAdminData, type HostSubmission } from '../../components/AdminLayout'
import { dateKey, resolvePrice, buildMonthDays } from '../../lib/pricingCalendar'

function AdminPricingPanel({ submission }: { submission: HostSubmission }) {
  const { updatePricing, fetchDateOverrides, setDateOverride } = useAdminData()
  const [draft, setDraft] = useState({
    pricePerNight: submission.price_per_night,
    weekendAdjustmentPct: submission.weekend_adjustment_pct,
    smartPricingEnabled: submission.smart_pricing_enabled,
    cleaningFee: submission.cleaning_fee,
    petFee: submission.pet_fee,
    extraGuestFee: submission.extra_guest_fee,
    discountNewListing: submission.discount_new_listing,
    discountLastMinute: submission.discount_last_minute,
    discountWeekly: submission.discount_weekly,
    discountMonthly: submission.discount_monthly,
    minNights: submission.min_nights,
    maxNights: submission.max_nights,
    cancellationPolicy: submission.cancellation_policy,
    nonRefundableDiscountEnabled: submission.non_refundable_discount_enabled,
  })
  const [overrides, setOverrides] = useState<{ date: string; nightlyRate: number }[]>([])
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date()
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [overrideInput, setOverrideInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDateOverrides(submission.id).then(setOverrides)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission.id])

  const overrideMap = useMemo(() => new Map(overrides.map((o) => [o.date, o.nightlyRate])), [overrides])
  const monthDays = useMemo(() => buildMonthDays(monthCursor), [monthCursor])

  const save = async (patch: Partial<typeof draft>) => {
    setSaving(true)
    const next = { ...draft, ...patch }
    setDraft(next)
    await updatePricing(submission.id, patch)
    setSaving(false)
  }

  const saveOverride = async (date: string, rate: number | null) => {
    setSaving(true)
    const ok = await setDateOverride(submission.id, date, rate)
    if (ok) {
      setOverrides((prev) => {
        const rest = prev.filter((o) => o.date !== date)
        return rate === null ? rest : [...rest, { date, nightlyRate: rate }]
      })
      setSelectedDate(null)
    }
    setSaving(false)
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Base price (₹/night)</label>
          <input
            type="number"
            value={draft.pricePerNight}
            onChange={(e) => setDraft({ ...draft, pricePerNight: Number(e.target.value) })}
            onBlur={(e) => save({ pricePerNight: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Weekend adjustment (%)</label>
          <input
            type="number"
            value={Math.round(draft.weekendAdjustmentPct * 100)}
            onChange={(e) => setDraft({ ...draft, weekendAdjustmentPct: Number(e.target.value) / 100 })}
            onBlur={(e) => save({ weekendAdjustmentPct: Number(e.target.value) / 100 })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={draft.smartPricingEnabled}
            onChange={(e) => save({ smartPricingEnabled: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
          />
          Smart pricing enabled
        </label>
        {(
          [
            ['cleaningFee', 'Cleaning fee'],
            ['petFee', 'Pet fee'],
            ['extraGuestFee', 'Extra guest fee'],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-slate-600">{label} (₹)</label>
            <input
              type="number"
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
              onBlur={(e) => save({ [key]: Number(e.target.value) } as Partial<typeof draft>)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        ))}
        <div className="border-t border-slate-200 pt-3">
          <p className="mb-1.5 text-xs font-semibold text-slate-600">Discounts</p>
          {(
            [
              ['discountNewListing', 'New listing 20%'],
              ['discountLastMinute', 'Last-minute 1%'],
              ['discountWeekly', 'Weekly 10%'],
              ['discountMonthly', 'Monthly 15%'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 py-0.5 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={(e) => save({ [key]: e.target.checked } as Partial<typeof draft>)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Min nights</label>
            <input
              type="number"
              value={draft.minNights}
              onChange={(e) => setDraft({ ...draft, minNights: Number(e.target.value) })}
              onBlur={(e) => save({ minNights: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Max nights</label>
            <input
              type="number"
              value={draft.maxNights}
              onChange={(e) => setDraft({ ...draft, maxNights: Number(e.target.value) })}
              onBlur={(e) => save({ maxNights: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">Cancellation policy</label>
          <select
            value={draft.cancellationPolicy}
            onChange={(e) => save({ cancellationPolicy: e.target.value as 'flexible' | 'firm' })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="flexible">Flexible</option>
            <option value="firm">Firm</option>
          </select>
          <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={draft.nonRefundableDiscountEnabled}
              onChange={(e) => save({ nonRefundableDiscountEnabled: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
            />
            Non-refundable option enabled
          </label>
        </div>

        {saving && <p className="text-xs text-slate-400">Saving…</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonthCursor(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() - 1, 1)))}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-bold text-slate-800">
            {monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </p>
          <button
            onClick={() => setMonthCursor(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 1)))}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {monthDays.map((d, i) => {
            if (!d) return <div key={`b-${i}`} />
            const key = dateKey(d)
            const price = resolvePrice(draft, d, overrideMap)
            const isOverridden = overrideMap.has(key)
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDate(key)
                  setOverrideInput(String(price))
                }}
                className={`rounded-lg border p-1 text-left transition ${
                  selectedDate === key ? 'border-primary-500 bg-primary-50' : isOverridden ? 'border-accent-300 bg-accent-50' : 'border-slate-200 bg-white'
                }`}
              >
                <p className="text-[10px] font-semibold text-slate-700">{d.getUTCDate()}</p>
                <p className="text-[9px] text-slate-500">₹{price.toLocaleString('en-IN')}</p>
              </button>
            )
          })}
        </div>

        {selectedDate && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
            <span className="text-xs font-semibold text-slate-600">{selectedDate}</span>
            <input
              type="number"
              value={overrideInput}
              onChange={(e) => setOverrideInput(e.target.value)}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-primary-500"
            />
            <button
              onClick={() => saveOverride(selectedDate, Number(overrideInput))}
              disabled={!(Number(overrideInput) > 0)}
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Save
            </button>
            {overrideMap.has(selectedDate) && (
              <button onClick={() => saveOverride(selectedDate, null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600">
                Clear
              </button>
            )}
            <button onClick={() => setSelectedDate(null)} className="text-xs font-semibold text-slate-400">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminPropertiesPage() {
  const { stats, submissions, submissionsConfigured, submissionsMessage, decidingId, decide } = useAdminData()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Property approvals — approving here makes a submission a live, publicly searchable listing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Property Approvals</h2>
            <p className="text-xs text-slate-500">Approving a submission makes it a live, publicly searchable listing.</p>
          </div>
        </div>

        {!submissionsConfigured ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {submissionsMessage ?? 'Connect Supabase (SUPABASE_SERVICE_ROLE_KEY) to review submissions here.'}
          </p>
        ) : submissions === null ? (
          <p className="text-sm text-slate-400">Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-slate-400">No host submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {s.photo_urls?.length > 0 ? (
                    <div className="flex shrink-0 -space-x-2">
                      {s.photo_urls.slice(0, 3).map((url, i) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View photo ${i + 1} of ${s.photo_urls.length}`}
                        >
                          <img
                            src={url}
                            alt=""
                            className="h-12 w-12 rounded-lg border-2 border-white object-cover shadow-sm transition hover:scale-105 hover:z-10 relative"
                          />
                        </a>
                      ))}
                      {s.photo_urls.length > 3 && (
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-bold text-slate-500">
                          +{s.photo_urls.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                      <Home className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="flex items-center gap-2 font-bold text-slate-900">
                      {s.property_title}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          s.status === 'approved'
                            ? 'bg-accent-50 text-accent-700'
                            : s.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.property_type} · {s.neighborhood}, {s.city} · ₹{s.price_per_night}/night · by {s.owner_name}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => decide(s.id, 'approved')}
                    disabled={decidingId === s.id || s.status === 'approved'}
                    className="flex items-center gap-1.5 rounded-lg border border-accent-300 bg-accent-50 px-3 py-1.5 text-xs font-bold text-accent-700 transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => decide(s.id, 'rejected')}
                    disabled={decidingId === s.id || s.status === 'rejected'}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  {s.status !== 'pending' && (
                    <button
                      onClick={() => decide(s.id, 'pending')}
                      disabled={decidingId === s.id}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Clock className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <IndianRupee className="h-3.5 w-3.5" /> Pricing {expandedId === s.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              {expandedId === s.id && <AdminPricingPanel submission={s} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet backup log — the pre-Supabase mirror of the same submissions, kept as a
          secondary reference (e.g. if Supabase were ever unreachable). Not the source of truth. */}
      {stats && stats.recent.hostListing.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="mb-1 text-sm font-extrabold text-slate-900">Submission Log (Sheets backup)</h2>
          <p className="mb-4 text-xs text-slate-500">
            Mirrors the same host submissions to Google Sheets — useful as a backup, not the source of truth.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  {['Time', 'Owner', 'Email', 'Phone', 'Title', 'City'].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent.hostListing.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    {row.slice(0, 6).map((cell, j) => (
                      <td key={j} className="max-w-xs truncate px-5 py-3 text-slate-600">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
