import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { clearAdminSessionCookie } from '../_lib/adminAuth.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  res.setHeader('Set-Cookie', clearAdminSessionCookie())
  res.status(200).json({ ok: true })
}
