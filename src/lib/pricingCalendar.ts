/** Shared date math for host/admin listing pricing calendars — kept out of
 * any one page so HostPricingPage.tsx and AdminProperties.tsx compute the
 * same resolved price the same way, matching the server's resolveNightlyRate
 * in api/_lib/stayBooking.ts (display-only here; the server is still the
 * authoritative source for anything actually charged). */

export interface ListingPricingSettings {
  pricePerNight: number
  weekendAdjustmentPct: number
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function resolvePrice(listing: ListingPricingSettings, date: Date, overrideMap: Map<string, number>): number {
  const key = dateKey(date)
  if (overrideMap.has(key)) return overrideMap.get(key)!
  const isWeekend = date.getUTCDay() === 5 || date.getUTCDay() === 6
  return isWeekend ? Math.round(listing.pricePerNight * (1 + listing.weekendAdjustmentPct)) : listing.pricePerNight
}

/** A month grid padded with leading `null`s for the days-of-week header to line up. */
export function buildMonthDays(monthCursor: Date): (Date | null)[] {
  const year = monthCursor.getUTCFullYear()
  const month = monthCursor.getUTCMonth()
  const firstDay = new Date(Date.UTC(year, month, 1))
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const leadingBlanks = firstDay.getUTCDay()
  const days: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(Date.UTC(year, month, d)))
  return days
}
