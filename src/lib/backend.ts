type SubmissionType = 'lead' | 'signup' | 'newsletter' | 'contact'

const ENDPOINTS: Record<SubmissionType, string> = {
  lead: '/api/leads',
  signup: '/api/signup',
  newsletter: '/api/newsletter',
  contact: '/api/contact',
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
    const res = await fetch(ENDPOINTS[type], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
