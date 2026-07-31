import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { getClientIp, readJsonBody } from '../_lib/http.js'
import { rateLimit } from '../_lib/rateLimit.js'
import { verifyListingAccessCode } from '../_lib/adminAuth.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'

/** Host-side pricing/calendar management for a single listing. There's no
 * real per-host login (see CLAUDE.md), so ownership here is proven with a
 * per-listing access code generated at submission time (host_submissions
 * .access_code) instead of email-matching or a real account — every request
 * must supply it, and it's checked with the same timing-safe comparison the
 * admin passcode uses (see api/_lib/adminAuth.ts). */

const PRICING_COLUMNS =
  'id, property_title, price_per_night, weekend_adjustment_pct, smart_pricing_enabled, cleaning_fee, pet_fee, extra_guest_fee, discount_new_listing, discount_last_minute, discount_weekly, discount_monthly, min_nights, max_nights, cancellation_policy, non_refundable_discount_enabled, access_code'

interface PricingUpdate {
  pricePerNight?: number
  weekendAdjustmentPct?: number
  smartPricingEnabled?: boolean
  cleaningFee?: number
  petFee?: number
  extraGuestFee?: number
  discountNewListing?: boolean
  discountLastMinute?: boolean
  discountWeekly?: boolean
  discountMonthly?: boolean
  minNights?: number
  maxNights?: number
  cancellationPolicy?: 'flexible' | 'firm'
  nonRefundableDiscountEnabled?: boolean
}

function getParam(req: ApiRequest, key: string): string | undefined {
  const raw = req.query[key]
  return Array.isArray(raw) ? raw[0] : raw
}

function validatePricing(pricing: PricingUpdate): string | null {
  if (pricing.pricePerNight !== undefined && !(pricing.pricePerNight >= 100)) {
    return 'Nightly rate must be at least ₹100.'
  }
  if (pricing.weekendAdjustmentPct !== undefined && !(pricing.weekendAdjustmentPct >= -0.5 && pricing.weekendAdjustmentPct <= 2)) {
    return 'Weekend adjustment must be between -50% and +200%.'
  }
  for (const [key, value] of [
    ['cleaningFee', pricing.cleaningFee],
    ['petFee', pricing.petFee],
    ['extraGuestFee', pricing.extraGuestFee],
  ] as const) {
    if (value !== undefined && !(value >= 0)) return `${key} cannot be negative.`
  }
  if (pricing.minNights !== undefined && !(pricing.minNights >= 1)) {
    return 'Minimum nights must be at least 1.'
  }
  if (pricing.maxNights !== undefined && !(pricing.maxNights >= (pricing.minNights ?? 1))) {
    return 'Maximum nights must be at least the minimum nights.'
  }
  if (pricing.cancellationPolicy !== undefined && !['flexible', 'firm'].includes(pricing.cancellationPolicy)) {
    return 'Invalid cancellation policy.'
  }
  return null
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const id = getParam(req, 'id')
  const code = getParam(req, 'code')
  const ip = getClientIp(req)

  if (!id) {
    res.status(400).json({ error: 'Missing listing id' })
    return
  }

  // Rate-limit by IP+listing so a stolen/guessed id can't be brute-forced —
  // every attempt counts, successful or not, since this guards a guessable
  // secret rather than a login with lockout-on-success semantics.
  const limit = rateLimit(`listing-pricing:${ip}:${id}`, 10, 15 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many attempts. Please try again later.' })
    return
  }

  if (!code) {
    res.status(401).json({ error: 'Access code required' })
    return
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  const { data: listing, error: fetchError } = await admin
    .from('host_submissions')
    .select(PRICING_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !listing || !verifyListingAccessCode(code, listing.access_code)) {
    res.status(401).json({ error: 'Incorrect access code' })
    return
  }

  if (req.method === 'GET') {
    const { data: overrides, error: overridesError } = await admin
      .from('listing_date_prices')
      .select('price_date, nightly_rate')
      .eq('listing_id', id)
      .order('price_date', { ascending: true })

    if (overridesError) {
      res.status(502).json({ error: overridesError.message })
      return
    }

    res.status(200).json({
      listing: {
        id: listing.id,
        propertyTitle: listing.property_title,
        pricePerNight: listing.price_per_night,
        weekendAdjustmentPct: listing.weekend_adjustment_pct,
        smartPricingEnabled: listing.smart_pricing_enabled,
        cleaningFee: listing.cleaning_fee,
        petFee: listing.pet_fee,
        extraGuestFee: listing.extra_guest_fee,
        discountNewListing: listing.discount_new_listing,
        discountLastMinute: listing.discount_last_minute,
        discountWeekly: listing.discount_weekly,
        discountMonthly: listing.discount_monthly,
        minNights: listing.min_nights,
        maxNights: listing.max_nights,
        cancellationPolicy: listing.cancellation_policy,
        nonRefundableDiscountEnabled: listing.non_refundable_discount_enabled,
      },
      dateOverrides: (overrides ?? []).map((o) => ({ date: o.price_date, nightlyRate: o.nightly_rate })),
    })
    return
  }

  if (req.method === 'PATCH') {
    const body = readJsonBody<{
      pricing?: PricingUpdate
      setOverrides?: { date: string; nightlyRate: number }[]
      clearOverrides?: string[]
    }>(req)

    if (body.pricing) {
      const validationError = validatePricing(body.pricing)
      if (validationError) {
        res.status(400).json({ error: validationError })
        return
      }
      const { error } = await admin
        .from('host_submissions')
        .update({
          ...(body.pricing.pricePerNight !== undefined && { price_per_night: body.pricing.pricePerNight }),
          ...(body.pricing.weekendAdjustmentPct !== undefined && { weekend_adjustment_pct: body.pricing.weekendAdjustmentPct }),
          ...(body.pricing.smartPricingEnabled !== undefined && { smart_pricing_enabled: body.pricing.smartPricingEnabled }),
          ...(body.pricing.cleaningFee !== undefined && { cleaning_fee: body.pricing.cleaningFee }),
          ...(body.pricing.petFee !== undefined && { pet_fee: body.pricing.petFee }),
          ...(body.pricing.extraGuestFee !== undefined && { extra_guest_fee: body.pricing.extraGuestFee }),
          ...(body.pricing.discountNewListing !== undefined && { discount_new_listing: body.pricing.discountNewListing }),
          ...(body.pricing.discountLastMinute !== undefined && { discount_last_minute: body.pricing.discountLastMinute }),
          ...(body.pricing.discountWeekly !== undefined && { discount_weekly: body.pricing.discountWeekly }),
          ...(body.pricing.discountMonthly !== undefined && { discount_monthly: body.pricing.discountMonthly }),
          ...(body.pricing.minNights !== undefined && { min_nights: body.pricing.minNights }),
          ...(body.pricing.maxNights !== undefined && { max_nights: body.pricing.maxNights }),
          ...(body.pricing.cancellationPolicy !== undefined && { cancellation_policy: body.pricing.cancellationPolicy }),
          ...(body.pricing.nonRefundableDiscountEnabled !== undefined && { non_refundable_discount_enabled: body.pricing.nonRefundableDiscountEnabled }),
        })
        .eq('id', id)

      if (error) {
        res.status(502).json({ error: error.message })
        return
      }
    }

    if (body.setOverrides?.length) {
      for (const o of body.setOverrides) {
        if (!o.date || !(o.nightlyRate > 0)) {
          res.status(400).json({ error: 'Each override needs a date and a positive nightly rate.' })
          return
        }
      }
      const { error } = await admin
        .from('listing_date_prices')
        .upsert(
          body.setOverrides.map((o) => ({ listing_id: id, price_date: o.date, nightly_rate: o.nightlyRate })),
          { onConflict: 'listing_id,price_date' },
        )

      if (error) {
        res.status(502).json({ error: error.message })
        return
      }
    }

    if (body.clearOverrides?.length) {
      const { error } = await admin
        .from('listing_date_prices')
        .delete()
        .eq('listing_id', id)
        .in('price_date', body.clearOverrides)

      if (error) {
        res.status(502).json({ error: error.message })
        return
      }
    }

    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
