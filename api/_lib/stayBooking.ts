import { properties } from '../../src/data/properties.js'
import { getSupabasePublic } from './supabasePublic.js'
import { getSupabaseAdmin } from './supabaseAdmin.js'

/** Real tenant-marketplace booking pricing — separate from pricing.ts's
 * computeBookingTotal, which is exclusively used by the unrelated
 * /enterprise demo area (see CLAUDE.md). Nothing here is shared with that. */

// Host commission is unchanged; the guest-facing fee was raised to 15% and
// bundled into a single guest-visible price (no separate "service fee" line)
// per product decision — hosts/admin still see it broken out separately.
export const HOST_COMMISSION_PCT = 0.02
export const GUEST_SERVICE_FEE_PCT = 0.15

// Simplified 2-tier Indian hotel-accommodation GST slab (assessed on the
// per-night tariff, not the total booking value). This is an ESTIMATE for
// display purposes only — confirm the exact applicable slab and whether GST
// registration/remittance is required with a tax advisor before relying on
// it; this code does not file or remit anything.
const GST_LOW_RATE = 0.12
const GST_HIGH_RATE = 0.18
const GST_HIGH_RATE_THRESHOLD = 7500

export function computeGstRate(nightlyRate: number): number {
  return nightlyRate > GST_HIGH_RATE_THRESHOLD ? GST_HIGH_RATE : GST_LOW_RATE
}

interface PropertyPricingInfo {
  title: string
  nightlyRate: number
  securityDeposit: number
  maxGuests: number
  /** Fri/Sat markup as a fraction (e.g. 0.15 = +15%), 0 for static catalog
   * properties which have no host-configurable pricing. */
  weekendAdjustmentPct: number
  /** Raw (un-prefixed) host_submissions id, or null for a static catalog
   * property — used to look up per-date price overrides. */
  hostListingId: string | null
}

/** Looks up nightly rate / deposit / capacity for either a static demo
 * property or an approved host listing (host-<uuid> id) — the two places a
 * bookable property can live. Never trusts client-supplied amounts for any
 * of these, matching the project's "server computes every rupee" rule. */
export async function getPropertyForBooking(propertyId: string): Promise<PropertyPricingInfo | null> {
  const staticProperty = properties.find((p) => p.id === propertyId)
  if (staticProperty) {
    return {
      title: staticProperty.title,
      nightlyRate: staticProperty.price,
      securityDeposit: staticProperty.deposit,
      maxGuests: staticProperty.maxGuests,
      weekendAdjustmentPct: 0,
      hostListingId: null,
    }
  }

  if (!propertyId.startsWith('host-')) return null
  const supabase = getSupabasePublic()
  if (!supabase) return null

  const rawId = propertyId.replace('host-', '')
  const { data, error } = await supabase
    .from('approved_listings')
    .select('property_title, price_per_night, security_deposit, max_guests, weekend_adjustment_pct')
    .eq('id', rawId)
    .maybeSingle()

  if (error || !data) return null
  return {
    title: data.property_title,
    nightlyRate: data.price_per_night,
    securityDeposit: data.security_deposit,
    maxGuests: data.max_guests,
    weekendAdjustmentPct: data.weekend_adjustment_pct ?? 0,
    hostListingId: rawId,
  }
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Per-date overrides a host has set for their listing's calendar, keyed by
 * YYYY-MM-DD, for the [from, to) range. Reads with the service-role key
 * since listing_date_prices has no anon-readable policy at all (see
 * supabase/host_listing_pricing.sql). Fails soft (empty map) if the
 * service-role client isn't configured, or the query errors, rather than
 * blocking a booking over a calendar feature outage. */
async function getDateOverrides(hostListingId: string, from: Date, to: Date): Promise<Map<string, number>> {
  const overrides = new Map<string, number>()
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('listing_date_prices')
      .select('price_date, nightly_rate')
      .eq('listing_id', hostListingId)
      .gte('price_date', dateKey(from))
      .lt('price_date', dateKey(to))

    if (!error && data) {
      for (const row of data) overrides.set(row.price_date, row.nightly_rate)
    }
  } catch {
    // Service-role key not configured — fall back to weekend/base pricing.
  }
  return overrides
}

/** Resolves what a single night actually costs: an explicit host-set date
 * override first, else the base rate bumped by the host's weekend markup on
 * Fri/Sat, else the flat base rate. Static catalog properties always have
 * weekendAdjustmentPct 0 and hostListingId null, so they stay flat — they
 * have no owning host row to configure this from. */
export function resolveNightlyRate(property: PropertyPricingInfo, date: Date, overrides: Map<string, number>): number {
  if (property.hostListingId) {
    const override = overrides.get(dateKey(date))
    if (override !== undefined) return override
  }

  const day = date.getUTCDay() // 0 = Sun ... 6 = Sat
  const isWeekend = day === 5 || day === 6
  return isWeekend ? Math.round(property.nightlyRate * (1 + property.weekendAdjustmentPct)) : property.nightlyRate
}

export interface StayBookingInput {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
}

export interface StayBookingBreakdown {
  propertyId: string
  propertyTitle: string
  nights: number
  nightlyRate: number
  roomSubtotal: number
  guestServiceFee: number
  /** roomSubtotal + guestServiceFee, bundled into one guest-facing number —
   * guests never see the service fee as its own line item (hosts/admin do,
   * via guestServiceFee directly). */
  guestBundledSubtotal: number
  gstRate: number
  gstAmount: number
  securityDeposit: number
  guestTotal: number
  hostCommission: number
  hostPayoutAmount: number
}

/** Powers the tenant-facing 7-day price preview (src/components/PriceCalendar.tsx)
 * for host listings — unlike the static catalog's computeWeeklyCalendar (a
 * fixed day-of-week curve with no host input), this reflects the actual
 * weekend markup / date overrides a host has set, via the same resolver
 * real bookings use. Returns null for static catalog ids (those still use
 * pricing.ts's computeWeeklyCalendar) or unknown ids. */
export async function computeHostWeeklyCalendar(propertyId: string): Promise<{ propertyId: string; days: { date: string; label: string; price: number }[] } | null> {
  const property = await getPropertyForBooking(propertyId)
  if (!property || !property.hostListingId) return null

  const today = new Date()
  const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const to = new Date(from)
  to.setUTCDate(to.getUTCDate() + 7)
  const overrides = await getDateOverrides(property.hostListingId, from, to)

  const days = []
  const cursor = new Date(from)
  for (let i = 0; i < 7; i++) {
    days.push({
      date: dateKey(cursor),
      label: cursor.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }),
      price: resolveNightlyRate(property, cursor, overrides),
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return { propertyId, days }
}

export async function computeStayBookingBreakdown(input: StayBookingInput): Promise<StayBookingBreakdown | { error: string } | null> {
  const property = await getPropertyForBooking(input.propertyId)
  if (!property) return null

  const checkInDate = new Date(input.checkIn)
  const checkOutDate = new Date(input.checkOut)
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  if (!Number.isFinite(nights) || nights < 1 || nights > 60) {
    return { error: 'Check-in/check-out dates are invalid.' }
  }
  if (!Number.isInteger(input.guests) || input.guests < 1) {
    return { error: 'Guest count is invalid.' }
  }
  if (input.guests > property.maxGuests) {
    return { error: `This property sleeps up to ${property.maxGuests} guests.` }
  }

  const overrides = property.hostListingId
    ? await getDateOverrides(property.hostListingId, checkInDate, checkOutDate)
    : new Map<string, number>()

  let roomSubtotal = 0
  const cursor = new Date(checkInDate)
  for (let i = 0; i < nights; i++) {
    roomSubtotal += resolveNightlyRate(property, cursor, overrides)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const guestServiceFee = Math.round(roomSubtotal * GUEST_SERVICE_FEE_PCT)
  const gstRate = computeGstRate(property.nightlyRate)
  const gstAmount = Math.round(roomSubtotal * gstRate)
  const hostCommission = Math.round(roomSubtotal * HOST_COMMISSION_PCT)
  const guestBundledSubtotal = roomSubtotal + guestServiceFee
  // Security deposit is not collected through the online payment — per the
  // property FAQ/cancellation copy, hosts collect and refund it directly at
  // checkout, so it's excluded from the Razorpay-charged guestTotal.
  const guestTotal = guestBundledSubtotal + gstAmount

  return {
    propertyId: input.propertyId,
    propertyTitle: property.title,
    nights,
    nightlyRate: property.nightlyRate,
    roomSubtotal,
    guestServiceFee,
    guestBundledSubtotal,
    gstRate,
    gstAmount,
    securityDeposit: property.securityDeposit,
    guestTotal,
    hostCommission,
    hostPayoutAmount: roomSubtotal - hostCommission,
  }
}
