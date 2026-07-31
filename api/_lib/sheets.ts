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

/** Unlike forwardToSheet (fire-and-forget, swallows all errors), this awaits
 * the Apps Script response and reports success/failure — needed for OTP
 * delivery, where the caller must know whether to tell the user "code sent"
 * or "delivery failed, try again" rather than assuming success. */
export async function sendViaAppsScriptAwaited(type: string, payload: Record<string, unknown>): Promise<boolean> {
  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) return false

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type, ...payload }),
    })
    if (!res.ok) return false
    const data = await res.json().catch(() => null)
    return Boolean((data as { ok?: boolean } | null)?.ok)
  } catch {
    return false
  }
}

export async function fetchSheetStats(adminKey: string): Promise<unknown> {
  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) throw new Error('SHEETS_WEBAPP_URL is not configured')

  const res = await fetch(`${url}?action=stats&key=${encodeURIComponent(adminKey)}`)
  if (!res.ok) throw new Error(`Sheet stats request failed with ${res.status}`)
  return res.json()
}
