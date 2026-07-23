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
    const raw = (await fetchSheetStats(adminKey)) as {
      counts: Record<string, number>
      recent: Record<string, unknown[][]>
    }
    // The Apps Script sheet backend keys its data by singular submission type
    // (lead, signup, ...) — the dashboard's Stats shape uses plural keys for
    // leads/signups (matching the sheet tab UI labels). Remap here rather
    // than in Code.gs, since that requires a manual re-paste + redeploy in
    // the Apps Script editor (see CLAUDE.md) while this deploys automatically.
    const counts = {
      leads: raw.counts?.lead ?? 0,
      signups: raw.counts?.signup ?? 0,
      contact: raw.counts?.contact ?? 0,
      newsletter: raw.counts?.newsletter ?? 0,
      hostListing: raw.counts?.hostListing ?? 0,
    }
    const recent = {
      leads: raw.recent?.lead ?? [],
      signups: raw.recent?.signup ?? [],
      contact: raw.recent?.contact ?? [],
      newsletter: raw.recent?.newsletter ?? [],
      hostListing: raw.recent?.hostListing ?? [],
    }
    res.status(200).json({ configured: true, counts, recent })
  } catch (err) {
    res.status(502).json({ error: `Could not reach the sheet backend: ${(err as Error).message}` })
  }
}
