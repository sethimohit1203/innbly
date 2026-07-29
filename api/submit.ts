import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { getClientIp, readJsonBody } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { forwardToSheet } from './_lib/sheets.js'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'

/** Combines what used to be five separate route files (leads, signup,
 * newsletter, contact, host-listing) into one — Vercel's Hobby plan caps a
 * deployment at 12 serverless functions, and adding the booking flow's new
 * routes pushed the count past that. These five all did the same shape of
 * thing (rate limit → validate → best-effort forward to Google Sheets), so
 * consolidating behind a `type` field costs nothing functionally and buys
 * headroom for future routes. 'review' was added later and takes a
 * different path (see handleReview below) since it needs a Supabase write,
 * not just a Sheets forward. */

type SubmissionType = 'lead' | 'signup' | 'newsletter' | 'contact' | 'hostListing' | 'review'

const RATE_LIMITS: Record<SubmissionType, { max: number; windowMs: number; message: string }> = {
  lead: { max: 5, windowMs: 10 * 60 * 1000, message: 'Too many visit requests. Please try again later.' },
  signup: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many signup attempts. Please try again later.' },
  newsletter: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many attempts. Please try again later.' },
  contact: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many messages sent. Please try again later.' },
  hostListing: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many submissions. Please try again later.' },
  review: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many reviews submitted. Please try again later.' },
}

function isValid(type: SubmissionType, body: Record<string, unknown>): boolean {
  switch (type) {
    case 'lead':
      return Boolean(body.name && body.phone && body.propertyTitle && body.visitDate)
    case 'signup':
      return Boolean(body.name && body.email && body.role)
    case 'newsletter':
      return Boolean(body.email)
    case 'contact':
      return Boolean(body.name && body.email && body.message)
    case 'hostListing':
      return Boolean(body.ownerName && body.ownerEmail && body.propertyTitle)
    case 'review':
      return Boolean(
        body.bookingId &&
          body.tenantEmail &&
          typeof body.rating === 'number' &&
          body.rating >= 1 &&
          body.rating <= 5,
      )
  }
}

interface ReviewBody {
  bookingId: string
  tenantEmail: string
  rating: number
  comment?: string
}

/** Reviews can't go through the generic forwardToSheet path — they need a
 * Supabase write, and that write must be trustworthy (never let the browser
 * insert a review for a booking it doesn't own, or for a stay that hasn't
 * happened yet), so it's verified server-side against the bookings table
 * with the service-role key, same trust boundary as api/bookings/verify.ts. */
async function handleReview(body: ReviewBody, res: ApiResponse) {
  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id, property_id, tenant_name, tenant_email, check_out, status')
    .eq('id', body.bookingId)
    .maybeSingle()

  if (bookingError || !booking) {
    res.status(404).json({ error: 'Booking not found.' })
    return
  }
  if (booking.tenant_email?.toLowerCase() !== body.tenantEmail.trim().toLowerCase()) {
    res.status(403).json({ error: 'This booking does not belong to that email.' })
    return
  }
  if (booking.status === 'cancelled') {
    res.status(400).json({ error: 'Cancelled bookings cannot be reviewed.' })
    return
  }
  if (new Date(booking.check_out) > new Date()) {
    res.status(400).json({ error: 'You can review a stay only after check-out.' })
    return
  }

  const { error: insertError } = await admin.from('reviews').insert({
    booking_id: booking.id,
    property_id: booking.property_id,
    tenant_name: booking.tenant_name,
    rating: Math.round(body.rating),
    comment: (body.comment ?? '').trim(),
  })

  if (insertError) {
    // Unique constraint on booking_id — this stay was already reviewed.
    if (insertError.code === '23505') {
      res.status(409).json({ error: 'You already reviewed this stay.' })
      return
    }
    res.status(502).json({ error: insertError.message })
    return
  }

  res.status(200).json({ ok: true })
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = readJsonBody<Record<string, unknown> & { type?: SubmissionType }>(req)
  const type = body.type
  if (!type || !RATE_LIMITS[type]) {
    res.status(400).json({ error: 'Unknown or missing submission type' })
    return
  }

  const ip = getClientIp(req)
  const { max, windowMs, message } = RATE_LIMITS[type]
  const limit = rateLimit(`${type}:${ip}`, max, windowMs)
  if (!limit.allowed) {
    res.status(429).json({ error: message, retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  if (!isValid(type, body)) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  if (type === 'review') {
    await handleReview(body as unknown as ReviewBody, res)
    return
  }

  const { type: _type, ...payload } = body
  await forwardToSheet(type, payload)
  res.status(200).json({ ok: true })
}
