import { useEffect, useState } from 'react'
import { IndianRupee, Check, Clock } from 'lucide-react'

interface Booking {
  id: string
  property_title: string
  host_name: string | null
  host_email: string | null
  tenant_name: string
  tenant_email: string
  tenant_phone: string
  check_in: string
  check_out: string
  nights: number
  guests: number
  guest_total: number
  host_commission: number
  host_payout_amount: number
  payout_status: 'unpaid' | 'paid'
  created_at: string
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [configured, setConfigured] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/bookings')
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setConfigured(data.configured !== false)
        setMessage(data.message ?? null)
        setBookings(data.bookings ?? [])
      } else {
        // Any non-2xx — most likely the bookings table hasn't been created
        // yet (run supabase/bookings.sql) or Supabase isn't configured.
        setConfigured(false)
        setMessage(data.error ?? 'Could not load bookings. Have you run supabase/bookings.sql yet?')
        setBookings([])
      }
    } catch {
      setConfigured(false)
      setMessage('Could not reach the server. Please try refreshing.')
      setBookings([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const markPayout = async (id: string, payoutStatus: 'unpaid' | 'paid') => {
    setUpdatingId(id)
    const res = await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, payoutStatus }),
    })
    if (res.ok) await load()
    setUpdatingId(null)
  }

  const unpaidTotal = (bookings ?? [])
    .filter((b) => b.payout_status === 'unpaid' && b.host_email)
    .reduce((sum, b) => sum + b.host_payout_amount, 0)

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">Bookings & Payouts</h2>
      <p className="mb-4 text-sm text-slate-500">
        Automatic host payouts need Razorpay Route (separate business approval) — until then, pay hosts yourself
        (bank/UPI) and mark it here once done.
      </p>

      {!configured ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {message ?? 'Connect Supabase (SUPABASE_SERVICE_ROLE_KEY) to see bookings here.'}
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            <IndianRupee className="h-4 w-4" /> ₹{unpaidTotal.toLocaleString('en-IN')} owed to hosts, not yet paid out
          </div>

          {bookings === null ? (
            <p className="text-sm text-slate-400">Loading bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-bold text-slate-900">
                        {b.property_title}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            b.payout_status === 'paid' ? 'bg-accent-50 text-accent-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {b.payout_status === 'paid' ? 'Payout sent' : 'Payout pending'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {b.check_in} → {b.check_out} · {b.nights} nights · {b.guests} guests · guest {b.tenant_name} ({b.tenant_email}, {b.tenant_phone})
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Host: {b.host_name ?? 'N/A (static demo listing)'}{b.host_email ? ` · ${b.host_email}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-bold text-slate-900">₹{b.guest_total.toLocaleString('en-IN')} paid</p>
                        <p className="text-xs text-slate-500">₹{b.host_payout_amount.toLocaleString('en-IN')} owed to host</p>
                      </div>
                      {b.payout_status === 'unpaid' ? (
                        <button
                          onClick={() => markPayout(b.id, 'paid')}
                          disabled={updatingId === b.id || !b.host_email}
                          title={!b.host_email ? 'No real host to pay for this listing' : undefined}
                          className="flex items-center gap-1.5 rounded-lg border border-accent-300 bg-accent-50 px-3 py-1.5 text-xs font-bold text-accent-700 transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" /> Mark Paid Out
                        </button>
                      ) : (
                        <button
                          onClick={() => markPayout(b.id, 'unpaid')}
                          disabled={updatingId === b.id}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Clock className="h-3.5 w-3.5" /> Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
