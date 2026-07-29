import { useCallback, useEffect, useState } from 'react'

export interface MyBooking {
  id: string
  property_id: string
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
  host_payout_amount: number
  payout_status: 'unpaid' | 'paid'
  status: 'upcoming' | 'cancelled'
  created_at: string
}

/** Shared by the host and tenant "My Bookings" views — both read the same
 * /api/bookings/mine endpoint, scoped by role + email. See api/bookings/mine.ts. */
export function useMyBookings(email: string | undefined, role: 'host' | 'tenant') {
  const [bookings, setBookings] = useState<MyBooking[] | null>(null)
  const [configured, setConfigured] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!email) return
    try {
      const res = await fetch(`/api/bookings/mine?role=${role}&email=${encodeURIComponent(email)}`)
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setConfigured(data.configured !== false)
        setMessage(data.message ?? null)
        setBookings(data.bookings ?? [])
      } else {
        setConfigured(false)
        setMessage(data.error ?? 'Could not load bookings.')
        setBookings([])
      }
    } catch {
      setConfigured(false)
      setMessage('Could not reach the server. Please try refreshing.')
      setBookings([])
    }
  }, [email, role])

  useEffect(() => {
    load()
  }, [load])

  const cancelBooking = useCallback(
    async (id: string) => {
      if (!email) return
      const res = await fetch(`/api/bookings/mine?role=${role}&email=${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'cancelled' }),
      })
      if (res.ok) await load()
      return res.ok
    },
    [email, role, load],
  )

  return { bookings, configured, message, reload: load, cancelBooking }
}
