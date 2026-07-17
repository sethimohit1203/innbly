import type { ApiRequest, ApiResponse } from './_lib/http'
import { getClientIp, readJsonBody } from './_lib/http'
import { rateLimit } from './_lib/rateLimit'
import { forwardToSheet } from './_lib/sheets'

interface SignupPayload {
  name?: string
  email?: string
  role?: string
  method?: string
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many signup attempts. Please try again later.', retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  const body = readJsonBody<SignupPayload>(req)
  if (!body.name || !body.email || !body.role) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  await forwardToSheet('signup', body as Record<string, unknown>)
  res.status(200).json({ ok: true })
}
