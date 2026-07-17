import type { ApiRequest, ApiResponse } from './_lib/http'
import { getClientIp, readJsonBody } from './_lib/http'
import { rateLimit } from './_lib/rateLimit'
import { forwardToSheet } from './_lib/sheets'

interface LeadPayload {
  name?: string
  phone?: string
  propertyId?: string
  propertyTitle?: string
  visitDate?: string
  slot?: string
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`leads:${ip}`, 5, 10 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many visit requests. Please try again later.', retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  const body = readJsonBody<LeadPayload>(req)
  if (!body.name || !body.phone || !body.propertyTitle || !body.visitDate) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  await forwardToSheet('lead', body as Record<string, unknown>)
  res.status(200).json({ ok: true })
}
