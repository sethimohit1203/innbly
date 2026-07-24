import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { getClientIp, readJsonBody } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { forwardToSheet } from './_lib/sheets.js'

/** Combines what used to be five separate route files (leads, signup,
 * newsletter, contact, host-listing) into one — Vercel's Hobby plan caps a
 * deployment at 12 serverless functions, and adding the booking flow's new
 * routes pushed the count past that. These five all did the same shape of
 * thing (rate limit → validate → best-effort forward to Google Sheets), so
 * consolidating behind a `type` field costs nothing functionally and buys
 * headroom for future routes. */

type SubmissionType = 'lead' | 'signup' | 'newsletter' | 'contact' | 'hostListing'

const RATE_LIMITS: Record<SubmissionType, { max: number; windowMs: number; message: string }> = {
  lead: { max: 5, windowMs: 10 * 60 * 1000, message: 'Too many visit requests. Please try again later.' },
  signup: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many signup attempts. Please try again later.' },
  newsletter: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many attempts. Please try again later.' },
  contact: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many messages sent. Please try again later.' },
  hostListing: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many submissions. Please try again later.' },
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
  }
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

  const { type: _type, ...payload } = body
  await forwardToSheet(type, payload)
  res.status(200).json({ ok: true })
}
