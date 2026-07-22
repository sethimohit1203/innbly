const STORAGE_KEY = 'innbly_my_listing_ids'

/** IDs of host_submissions rows this browser has submitted. There's no real
 * per-user backend session (see CLAUDE.md auth model), so "my listings" is
 * tracked locally rather than via a query the anon key isn't allowed to
 * run (host_submissions only grants anon INSERT, not SELECT). */
export function getMyListingIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addMyListingId(id: string) {
  try {
    const ids = getMyListingIds()
    if (!ids.includes(id)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]))
  } catch {
    // localStorage unavailable — the submission still succeeded, it just
    // won't show up in "My Listings" on this browser.
  }
}
