import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { getClientIp, readJsonBody } from '../_lib/http.js'
import { rateLimit } from '../_lib/rateLimit.js'
import { checkPasscode, createAdminSessionCookie } from '../_lib/adminAuth.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many attempts. Please try again later.' })
    return
  }

  const body = readJsonBody<{ passcode?: string }>(req)
  if (!body.passcode || !checkPasscode(body.passcode)) {
    res.status(401).json({ error: 'Incorrect passcode' })
    return
  }

  res.setHeader('Set-Cookie', createAdminSessionCookie())
  res.status(200).json({ ok: true })
}
