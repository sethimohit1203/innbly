export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

interface StatusFields {
  status: 'upcoming' | 'cancelled'
  check_out: string
}

/** "Completed" is never stored — it's derived from check_out being in the
 * past, since that state never needs a write. See supabase/bookings_status.sql. */
export function deriveBookingStatus(b: StatusFields): BookingStatus {
  if (b.status === 'cancelled') return 'cancelled'
  return new Date(b.check_out) < new Date() ? 'completed' : 'upcoming'
}

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  upcoming: 'bg-primary-50 text-primary-700',
  completed: 'bg-accent-50 text-accent-700',
  cancelled: 'bg-rose-50 text-rose-700',
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
