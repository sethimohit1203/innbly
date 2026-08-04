import { useState } from 'react'
import { IndianRupee, Check, Clock, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useMyBookings } from '../../hooks/useMyBookings'
import { deriveBookingStatus, BOOKING_STATUS_STYLES, BOOKING_STATUS_LABELS } from '../../lib/bookingStatus'

export function HostBookingsPage() {
  usePageMeta('Bookings', 'Track confirmed bookings and payouts for your listings on innbly.')
  const { user } = useAuth()
  const { bookings, configured, message, cancelBooking } = useMyBookings(user?.email, 'host')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const unpaidTotal = (bookings ?? [])
    .filter((b) => b.payout_status === 'unpaid' && deriveBookingStatus(b) !== 'cancelled')
    .reduce((sum, b) => sum + b.host_payout_amount, 0)

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return
    setCancellingId(id)
    await cancelBooking(id)
    setCancellingId(null)
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">Bookings</h2>
      <p className="mb-6 text-sm text-slate-500">Confirmed bookings for your listings and their payout status.</p>

      {!configured ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {message ?? 'Bookings are not available right now.'}
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            <IndianRupee className="h-4 w-4" /> ₹{unpaidTotal.toLocaleString('en-IN')} owed to you, not yet paid out
          </div>

          {bookings === null ? (
            <p className="text-sm text-slate-400">Loading bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings yet. Once a guest pays for a stay, it'll show up here.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const status = deriveBookingStatus(b)
                return (
                  <div key={b.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                          {b.property_title}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${BOOKING_STATUS_STYLES[status]}`}>
                            {BOOKING_STATUS_LABELS[status]}
                          </span>
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
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-bold text-slate-900">₹{b.guest_total.toLocaleString('en-IN')} paid</p>
                          <p className="text-xs text-slate-500">₹{b.host_payout_amount.toLocaleString('en-IN')} owed to you</p>
                        </div>
                        {b.payout_status === 'paid' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-accent-700">
                            <Check className="h-3.5 w-3.5" /> Paid out
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Clock className="h-3.5 w-3.5" /> Awaiting payout
                          </span>
                        )}
                        {status === 'upcoming' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            disabled={cancellingId === b.id}
                            className="flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
