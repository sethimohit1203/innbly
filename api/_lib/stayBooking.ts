import { properties } from '../../src/data/properties.js'
import { getSupabasePublic } from './supabasePublic.js'

/** Real tenant-marketplace booking pricing — separate from pricing.ts's
 * computeBookingTotal, which is exclusively used by the unrelated
 * /enterprise demo area (see CLAUDE.md). Nothing here is shared with that. */

// Undercutting Airbnb's typical split-fee model (host ~3%, guest service fee
// on top) to stand out on price, per product decision.
export const HOST_COMMISSION_PCT = 0.02
export const GUEST_SERVICE_FEE_PCT = 0.08

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
    }
  }

  if (!propertyId.startsWith('host-')) return null
  const supabase = getSupabasePublic()
  if (!supabase) return null

  const rawId = propertyId.replace('host-', '')
  const { data, error } = await supabase
    .from('approved_listings')
    .select('property_title, price_per_night, security_deposit, max_guests')
    .eq('id', rawId)
    .maybeSingle()

  if (error || !data) return null
  return {
    title: data.property_title,
    nightlyRate: data.price_per_night,
    securityDeposit: data.security_deposit,
    maxGuests: data.max_guests,
  }
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
  gstRate: number
  gstAmount: number
  securityDeposit: number
  guestTotal: number
  hostCommission: number
  hostPayoutAmount: number
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

  const roomSubtotal = property.nightlyRate * nights
  const guestServiceFee = Math.round(roomSubtotal * GUEST_SERVICE_FEE_PCT)
  const gstRate = computeGstRate(property.nightlyRate)
  const gstAmount = Math.round(roomSubtotal * gstRate)
  const hostCommission = Math.round(roomSubtotal * HOST_COMMISSION_PCT)
  const guestTotal = roomSubtotal + guestServiceFee + gstAmount + property.securityDeposit

  return {
    propertyId: input.propertyId,
    propertyTitle: property.title,
    nights,
    nightlyRate: property.nightlyRate,
    roomSubtotal,
    guestServiceFee,
    gstRate,
    gstAmount,
    securityDeposit: property.securityDeposit,
    guestTotal,
    hostCommission,
    hostPayoutAmount: roomSubtotal - hostCommission,
  }
}
