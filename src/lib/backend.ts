type SubmissionType = 'lead' | 'signup' | 'newsletter' | 'contact' | 'host-listing'

// api/submit.ts consolidates what used to be five separate route files
// behind a `type` field (Vercel's Hobby plan caps a deployment at 12
// serverless functions) — the Apps Script side keys its sheets by
// 'hostListing' (camelCase), so that's the one name translated here.
const SERVER_TYPE: Record<SubmissionType, string> = {
  lead: 'lead',
  signup: 'signup',
  newsletter: 'newsletter',
  contact: 'contact',
  'host-listing': 'hostListing',
}

export interface SubmitResult {
  ok: boolean
  error?: string
}

/** Posts to our own serverless API (never the Sheets URL directly — that
 * stays server-side only). Returns a result so callers can surface rate
 * limit or validation errors instead of failing silently. */
export async function submitToSheet(type: SubmissionType, payload: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: SERVER_TYPE[type], ...payload }),
    })

    if (res.status === 429) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.error ?? "You're doing that too often — please try again in a bit." }
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.error ?? 'Something went wrong. Please try again.' }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please check your connection and try again.' }
  }
}
