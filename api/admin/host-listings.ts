import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { readJsonBody } from '../_lib/http.js'
import { verifyAdminSession } from '../_lib/adminAuth.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'

interface PricingUpdate {
  pricePerNight?: number
  weekendAdjustmentPct?: number
  smartPricingEnabled?: boolean
  cleaningFee?: number
  petFee?: number
  extraGuestFee?: number
}

interface UpdatePayload {
  id?: string
  status?: 'approved' | 'rejected' | 'pending'
  action?: 'status' | 'pricing'
  pricing?: PricingUpdate
  setOverrides?: { date: string; nightlyRate: number }[]
  clearOverrides?: string[]
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!verifyAdminSession(req)) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(200).json({ configured: false, message: (err as Error).message, submissions: [] })
    return
  }

  if (req.method === 'GET') {
    // ?dateOverrides=<listingId> fetches one listing's calendar overrides
    // instead of the submissions list, so the admin pricing panel can show
    // the same per-date calendar the host sees.
    const dateOverridesId = req.query.dateOverrides
    const listingId = Array.isArray(dateOverridesId) ? dateOverridesId[0] : dateOverridesId
    if (listingId) {
      const { data, error } = await admin
        .from('listing_date_prices')
        .select('price_date, nightly_rate')
        .eq('listing_id', listingId)
        .order('price_date', { ascending: true })

      if (error) {
        res.status(502).json({ error: error.message })
        return
      }
      res.status(200).json({ dateOverrides: (data ?? []).map((o) => ({ date: o.price_date, nightlyRate: o.nightly_rate })) })
      return
    }

    const { data, error } = await admin
      .from('host_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }
    res.status(200).json({ configured: true, submissions: data })
    return
  }

  if (req.method === 'PATCH' || req.method === 'POST') {
    const body = readJsonBody<UpdatePayload>(req)
    // Missing `action` means the existing approve/reject flow — kept
    // backward-compatible with callers that only ever sent { id, status }.
    const action = body.action ?? 'status'

    if (!body.id) {
      res.status(400).json({ error: 'Missing id' })
      return
    }

    if (action === 'status') {
      if (!body.status || !['approved', 'rejected', 'pending'].includes(body.status)) {
        res.status(400).json({ error: 'Missing or invalid status' })
        return
      }

      const { error } = await admin
        .from('host_submissions')
        .update({ status: body.status })
        .eq('id', body.id)

      if (error) {
        res.status(502).json({ error: error.message })
        return
      }
      res.status(200).json({ ok: true })
      return
    }

    if (action === 'pricing') {
      // Admin edits any listing's pricing directly — already gated by
      // verifyAdminSession() above, no per-listing access code needed here
      // (that's only required on the host-side route, api/host/listing-pricing.ts).
      if (body.pricing) {
        const p = body.pricing
        if (p.pricePerNight !== undefined && !(p.pricePerNight >= 100)) {
          res.status(400).json({ error: 'Nightly rate must be at least ₹100.' })
          return
        }
        if (p.weekendAdjustmentPct !== undefined && !(p.weekendAdjustmentPct >= -0.5 && p.weekendAdjustmentPct <= 2)) {
          res.status(400).json({ error: 'Weekend adjustment must be between -50% and +200%.' })
          return
        }

        const { error } = await admin
          .from('host_submissions')
          .update({
            ...(p.pricePerNight !== undefined && { price_per_night: p.pricePerNight }),
            ...(p.weekendAdjustmentPct !== undefined && { weekend_adjustment_pct: p.weekendAdjustmentPct }),
            ...(p.smartPricingEnabled !== undefined && { smart_pricing_enabled: p.smartPricingEnabled }),
            ...(p.cleaningFee !== undefined && { cleaning_fee: p.cleaningFee }),
            ...(p.petFee !== undefined && { pet_fee: p.petFee }),
            ...(p.extraGuestFee !== undefined && { extra_guest_fee: p.extraGuestFee }),
          })
          .eq('id', body.id)

        if (error) {
          res.status(502).json({ error: error.message })
          return
        }
      }

      if (body.setOverrides?.length) {
        const { error } = await admin
          .from('listing_date_prices')
          .upsert(
            body.setOverrides.map((o) => ({ listing_id: body.id, price_date: o.date, nightly_rate: o.nightlyRate })),
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
          .eq('listing_id', body.id)
          .in('price_date', body.clearOverrides)
        if (error) {
          res.status(502).json({ error: error.message })
          return
        }
      }

      res.status(200).json({ ok: true })
      return
    }

    res.status(400).json({ error: 'Unknown action' })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
