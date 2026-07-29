import { useEffect, useState } from 'react'

function lastSeenKey(email: string) {
  return `innbly_host_bookings_last_seen_${email.toLowerCase()}`
}

/** Badge count for the host dashboard's Bookings tab — there's no real
 * push-notification infra (see CLAUDE.md: emails already go out via
 * Code.gs's sendBookingEmails), so "new" is tracked locally per host email
 * as "created_at newer than the last time this browser opened the tab". */
export function useNewBookingsCount(email: string | undefined) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!email) return
    let cancelled = false
    const lastSeen = localStorage.getItem(lastSeenKey(email))

    fetch(`/api/bookings/mine?role=host&email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || data.configured === false) return
        const bookings = (data.bookings ?? []) as { created_at: string }[]
        const n = lastSeen
          ? bookings.filter((b) => new Date(b.created_at) > new Date(lastSeen)).length
          : 0
        setCount(n)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [email])

  return count
}

export function markBookingsSeen(email: string) {
  try {
    localStorage.setItem(lastSeenKey(email), new Date().toISOString())
  } catch {
    // localStorage unavailable — badge just won't clear on this browser.
  }
}
