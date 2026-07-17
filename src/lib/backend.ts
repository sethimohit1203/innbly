type SubmissionType = 'lead' | 'signup' | 'newsletter' | 'contact'

const WEBAPP_URL = import.meta.env.VITE_SHEETS_WEBAPP_URL as string | undefined

export const isBackendConfigured = Boolean(WEBAPP_URL)

/**
 * Fire-and-forget POST to the Google Apps Script Web App.
 * Uses text/plain to avoid a CORS preflight (Apps Script doesn't handle OPTIONS).
 * Apps Script web apps don't return readable CORS headers to the browser, so we
 * can't inspect the response — this resolves once the request has been sent.
 */
export async function submitToSheet(type: SubmissionType, payload: Record<string, unknown>): Promise<void> {
  if (!WEBAPP_URL) return

  try {
    await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type, ...payload }),
      mode: 'no-cors',
    })
  } catch {
    // Silently ignore network failures — this is a best-effort mirror to the sheet.
  }
}
