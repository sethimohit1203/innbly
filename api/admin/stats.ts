import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { verifyAdminSession } from '../_lib/adminAuth.js'
import { fetchSheetStats } from '../_lib/sheets.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!verifyAdminSession(req)) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const adminKey = process.env.ADMIN_SHEETS_KEY
  if (!process.env.SHEETS_WEBAPP_URL || !adminKey) {
    res.status(200).json({
      configured: false,
      message: 'Connect the Google Sheets backend (SHEETS_WEBAPP_URL + ADMIN_SHEETS_KEY) to see live data here.',
      counts: { leads: 0, signups: 0, contact: 0, newsletter: 0, hostListing: 0 },
      recent: { leads: [], signups: [], contact: [], newsletter: [], hostListing: [] },
    })
    return
  }

  try {
    const stats = await fetchSheetStats(adminKey)
    res.status(200).json({ configured: true, ...(stats as object) })
  } catch (err) {
    res.status(502).json({ error: `Could not reach the sheet backend: ${(err as Error).message}` })
  }
}
