import type { ApiRequest, ApiResponse } from './_lib/http'
import { getClientIp, readJsonBody } from './_lib/http'
import { rateLimit } from './_lib/rateLimit'
import { forwardToSheet } from './_lib/sheets'

interface ContactPayload {
  name?: string
  email?: string
  phone?: string
  message?: string
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many messages sent. Please try again later.', retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  const body = readJsonBody<ContactPayload>(req)
  if (!body.name || !body.email || !body.message) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  await forwardToSheet('contact', body as Record<string, unknown>)
  res.status(200).json({ ok: true })
}
