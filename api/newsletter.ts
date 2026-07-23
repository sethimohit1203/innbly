import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { getClientIp, readJsonBody } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { forwardToSheet } from './_lib/sheets.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many attempts. Please try again later.', retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  const body = readJsonBody<{ email?: string }>(req)
  if (!body.email) {
    res.status(400).json({ error: 'Missing email' })
    return
  }

  await forwardToSheet('newsletter', { email: body.email })
  res.status(200).json({ ok: true })
}
