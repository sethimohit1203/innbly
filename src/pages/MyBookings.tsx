import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, XCircle, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useMyBookings, type MyBooking } from '../hooks/useMyBookings'
import { deriveBookingStatus, BOOKING_STATUS_STYLES, BOOKING_STATUS_LABELS } from '../lib/bookingStatus'

function ReviewForm({ booking, onSubmitted }: { booking: MyBooking; onSubmitted: () => void }) {
  const { showToast } = useToast()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review',
          bookingId: booking.id,
          tenantEmail: booking.tenant_email,
          rating,
          comment,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        showToast('Thanks for your review!')
        onSubmitted()
      } else {
        showToast(data.error ?? 'Could not submit review.', 'error')
      }
    } catch {
      showToast('Could not reach the server. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold text-slate-600">Rate your stay</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star className={`h-5 w-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell other travelers about your stay (optional)"
        rows={2}
        className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-primary-400 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}

export function MyBookingsPage() {
  usePageMeta('My Bookings', 'View your stay history, upcoming bookings, and leave reviews on innbly.')
  const { user } = useAuth()
  const { bookings, configured, message, cancelBooking } = useMyBookings(user?.email, 'tenant')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewedIds, setReviewedIds] = useState<string[]>([])

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return
    setCancellingId(id)
    await cancelBooking(id)
    setCancellingId(null)
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-slate-600">Sign in to see your bookings.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-slate-900">My Bookings</h1>
      <p className="mb-6 text-sm text-slate-500">Your stay history and upcoming reservations.</p>

      {!configured ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {message ?? 'Bookings are not available right now.'}
        </p>
      ) : bookings === null ? (
        <p className="text-sm text-slate-400">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-400">
          No bookings yet.{' '}
          <Link to="/search" className="font-semibold text-primary-600 hover:underline">
            Explore stays
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const status = deriveBookingStatus(b)
            const canReview = status === 'completed' && !reviewedIds.includes(b.id)
            return (
              <div key={b.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                      <Link to={`/property/${b.property_id}`} className="hover:underline">
                        {b.property_title}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${BOOKING_STATUS_STYLES[status]}`}>
                        {BOOKING_STATUS_LABELS[status]}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.check_in} → {b.check_out} · {b.nights} nights · {b.guests} guests
                    </p>
                    <p className="mt-1 text-xs text-slate-500">₹{b.guest_total.toLocaleString('en-IN')} paid</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {status === 'upcoming' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                    {canReview && reviewingId !== b.id && (
                      <button
                        onClick={() => setReviewingId(b.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-primary-300 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Leave a Review
                      </button>
                    )}
                  </div>
                </div>
                {reviewingId === b.id && (
                  <ReviewForm
                    booking={b}
                    onSubmitted={() => {
                      setReviewingId(null)
                      setReviewedIds((ids) => [...ids, b.id])
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
