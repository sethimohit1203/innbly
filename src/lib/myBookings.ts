const STORAGE_KEY = 'innbly_paid_property_ids'

/** Property ids this browser has completed a paid booking for. There's no
 * real per-tenant backend session (see CLAUDE.md), so "have I paid for
 * this stay" is tracked locally, same pattern as myListings.ts. Used to
 * gate the host's direct contact info behind a completed payment — see
 * PropertyDetail.tsx. */
export function getPaidPropertyIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function markPropertyPaid(propertyId: string) {
  try {
    const ids = getPaidPropertyIds()
    if (!ids.includes(propertyId)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, propertyId]))
  } catch {
    // localStorage unavailable — the booking still succeeded server-side,
    // it just won't unlock "Chat with Host" on this browser.
  }
}
