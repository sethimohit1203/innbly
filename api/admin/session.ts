import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { getClientIp, readJsonBody } from '../_lib/http.js'
import { rateLimit } from '../_lib/rateLimit.js'
import { checkPasscode, createAdminSessionCookie, clearAdminSessionCookie } from '../_lib/adminAuth.js'

// Combines the former admin/login.ts + admin/logout.ts into one route (see
// api/submit.ts for why — Vercel's Hobby plan caps a deployment at 12
// serverless functions). POST logs in, DELETE logs out.
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearAdminSessionCookie())
    res.status(200).json({ ok: true })
    return
  }

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
