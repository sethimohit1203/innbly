import { useState } from 'react'
import { X, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createBookingOrder, verifyBookingPayment, type BookingBreakdown } from '../lib/booking'
import { openRazorpayCheckout } from '../lib/razorpay'
import { markPropertyPaid } from '../lib/myBookings'
import type { Property } from '../types'

interface BookingModalProps {
  property: Property
  checkIn: string | null
  checkOut: string | null
  guests: number
  onClose: () => void
  onBooked: () => void
}

export function BookingModal({ property, checkIn, checkOut, guests, onClose, onBooked }: BookingModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [tenantName, setTenantName] = useState(user?.name ?? '')
  const [tenantEmail, setTenantEmail] = useState(user?.email ?? '')
  const [tenantPhone, setTenantPhone] = useState(user?.phone ?? '')
  const [breakdown, setBreakdown] = useState<BookingBreakdown | null>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const datesReady = Boolean(checkIn && checkOut)

  const loadBreakdown = async () => {
    if (!checkIn || !checkOut) return
    setError(null)
    setLoadingBreakdown(true)
    try {
      const { breakdown: b } = await createBookingOrder({ propertyId: property.id, checkIn, checkOut, guests })
      setBreakdown(b)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoadingBreakdown(false)
    }
  }

  const handlePay = async () => {
    if (!checkIn || !checkOut || !tenantName.trim() || !tenantEmail.trim() || !tenantPhone.trim()) {
      setError('Please fill in your name, email, and phone.')
      return
    }
    setError(null)
    setPaying(true)
    try {
      const order = await createBookingOrder({ propertyId: property.id, checkIn, checkOut, guests })
      setBreakdown(order.breakdown)

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'innbly',
        description: property.title,
        prefill: { name: tenantName, email: tenantEmail, contact: tenantPhone },
        theme: { color: '#d9332a' },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response) => {
          try {
            await verifyBookingPayment({
              ...response,
              propertyId: property.id,
              checkIn,
              checkOut,
              guests,
              tenantName,
              tenantEmail,
              tenantPhone,
            })
            markPropertyPaid(property.id)
            showToast('Booking confirmed! Check your email for details.')
            onBooked()
          } catch (err) {
            showToast((err as Error).message, 'error')
          } finally {
            setPaying(false)
          }
        },
      })
    } catch (err) {
      setError((err as Error).message)
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 animate-fade-in">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900">Reserve {property.title}</h2>

        {!datesReady ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Select your check-in and check-out dates above before reserving.
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
              <input
                type="email"
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
              <input
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {!breakdown && (
              <button
                onClick={loadBreakdown}
                disabled={loadingBreakdown}
                className="mt-4 w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700 disabled:opacity-50"
              >
                {loadingBreakdown ? 'Calculating…' : 'See price breakdown'}
              </button>
            )}

            {breakdown && (
              <div className="mt-4 space-y-1.5 rounded-xl border border-slate-200 p-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>₹{breakdown.nightlyRate.toLocaleString('en-IN')} × {breakdown.nights} night{breakdown.nights > 1 ? 's' : ''}</span>
                  <span>₹{breakdown.roomSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service fee</span>
                  <span>₹{breakdown.guestServiceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (est. GST {Math.round(breakdown.gstRate * 100)}%)</span>
                  <span>₹{breakdown.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                {breakdown.securityDeposit > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Refundable security deposit</span>
                    <span>₹{breakdown.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{breakdown.guestTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {error && <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent-50 p-3 text-xs text-accent-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Paid securely through innbly. The host's contact details unlock right after payment.</span>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {paying ? 'Processing…' : breakdown ? `Pay ₹${breakdown.guestTotal.toLocaleString('en-IN')} & Reserve` : 'Pay & Reserve'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
