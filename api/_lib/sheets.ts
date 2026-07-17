/** Server-only proxy to the Google Apps Script Web App. The URL lives in
 * process.env.SHEETS_WEBAPP_URL (no VITE_ prefix) so it is never bundled
 * into client JS — only this server code ever sees it. */

export async function forwardToSheet(type: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type, ...payload }),
    })
  } catch {
    // Best-effort mirror — the submission still succeeded from the caller's perspective.
  }
}

export async function fetchSheetStats(adminKey: string): Promise<unknown> {
  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) throw new Error('SHEETS_WEBAPP_URL is not configured')

  const res = await fetch(`${url}?action=stats&key=${encodeURIComponent(adminKey)}`)
  if (!res.ok) throw new Error(`Sheet stats request failed with ${res.status}`)
  return res.json()
}
