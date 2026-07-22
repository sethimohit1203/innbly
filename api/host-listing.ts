import type { ApiRequest, ApiResponse } from './_lib/http'
import { getClientIp, readJsonBody } from './_lib/http'
import { rateLimit } from './_lib/rateLimit'
import { forwardToSheet } from './_lib/sheets'

interface HostListingPayload {
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  propertyTitle?: string
  propertyType?: string
  description?: string
  city?: string
  neighborhood?: string
  address?: string
  maxGuests?: number
  pricePerNight?: number
  securityDeposit?: number
  amenities?: string[]
  photoUrls?: string[]
  documentUrls?: string[]
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`host-listing:${ip}`, 5, 60 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many submissions. Please try again later.', retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  const body = readJsonBody<HostListingPayload>(req)
  if (!body.ownerName || !body.ownerEmail || !body.propertyTitle) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  // Best-effort mirror to Google Sheets — Supabase (called separately by the
  // client) is the primary store for this submission, this is just a backup
  // + email notification. Never blocks or fails the caller's success state.
  await forwardToSheet('hostListing', body as Record<string, unknown>)
  res.status(200).json({ ok: true })
}
