import type { Property, PropertyType } from '../types'

export interface ApprovedListingRow {
  id: string
  created_at: string
  owner_name: string
  owner_phone: string
  property_title: string
  property_type: string
  description: string
  city: string
  neighborhood: string
  address: string
  max_guests: number
  price_per_night: number
  security_deposit: number
  amenities: string[]
  photo_urls: string[]
}

const FALLBACK_IMAGE = 'https://picsum.photos/seed/innbly-new-listing/800/600'

/** Approved host submissions don't collect everything the static demo
 * catalog has (ratings, reviews, landmarks, wifi speed, etc.) — those
 * fields get honest defaults for a brand-new, unreviewed listing rather
 * than fabricated values. */
export function mapApprovedListing(row: ApprovedListingRow): Property {
  return {
    id: `host-${row.id}`,
    title: row.property_title,
    propertyType: row.property_type as PropertyType,
    city: row.city,
    state: '',
    neighborhood: row.neighborhood,
    address: row.address,
    price: row.price_per_night,
    deposit: row.security_deposit,
    maxGuests: row.max_guests,
    minStayNights: 1,
    roomSizeSqft: 0,
    tenantPreference: 'Anyone',
    amenities: row.amenities ?? [],
    images: row.photo_urls && row.photo_urls.length > 0 ? row.photo_urls : [FALLBACK_IMAGE],
    verified: false,
    furnished: true,
    rating: 0,
    reviewCount: 0,
    description: row.description,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    hostResponseTime: 'New host',
    hostBio: `${row.owner_name} recently joined innbly as a host.`,
    hostResponseRate: 0,
    hostJoinedYear: new Date(row.created_at).getFullYear(),
    hostTotalListings: 1,
    hostLanguages: ['English'],
    wifiSpeedMbps: 0,
    freeCancellation: false,
    instantBook: false,
    availabilityStatus: 'Available',
    lifestyleTags: [],
    landmarks: [],
    ratingBreakdown: [],
    reviews: [],
  }
}
