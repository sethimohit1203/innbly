export type TenantPreference = 'Boys' | 'Girls' | 'Family' | 'Anyone'

export const LIFESTYLE_TAGS = [
  'Student Living',
  'Digital Nomad',
  'Family',
  'Corporate',
  'Backpacker',
  'Couple',
  'Senior Friendly',
  'Pet Friendly',
] as const
export type LifestyleTag = (typeof LIFESTYLE_TAGS)[number]

export type AvailabilityStatus = 'Available' | 'Limited' | 'Booked'
export type LandmarkType = 'Metro' | 'Gym' | 'Restaurant' | 'Cafe' | 'Hospital' | 'Market' | 'College' | 'Mall' | 'Beach' | 'Temple' | 'Airport' | 'Railway' | 'Office' | 'Attraction'

export const PROPERTY_TYPES = [
  'Hotels',
  'Apartments',
  'Resorts',
  'Villas',
  'Cabins',
  'Cottages',
  'Glamping Sites',
  'Serviced Apartments',
  'Holiday Homes',
  'Guest Houses',
  'Hostels',
  'Motels',
  'B&Bs',
  'Ryokans',
  'Riads',
  'Holiday Parks',
  'Homestays',
  'Campsites',
  'Country Houses',
  'Farm Stays',
  'Boats',
  'Luxury Tents',
  'Self Catering Accommodation',
  'Tiny Houses',
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]

/** The host-wizard "what kind of place is it" grid (Structure step) — a
 * different taxonomy from PROPERTY_TYPES above (which drives site-wide
 * category nav/filters/SEO pages and must stay as-is). This is the
 * dwelling-shape list a host picks from when listing, matching Airbnb's own
 * structure step; `host_submissions.property_type` stores whichever of
 * these strings was picked (the column is a plain text field, not
 * constrained to PROPERTY_TYPES). */
export const STRUCTURE_TYPES = [
  'House',
  'Flat/apartment',
  'Barn',
  'Bed & breakfast',
  'Boat',
  'Cabin',
  'Campervan/motorhome',
  'Casa particular',
  'Castle',
  'Cave',
  'Container',
  'Cycladic home',
  'Dammuso',
  'Dome',
  'Earth home',
  'Farm',
  'Guest house',
  'Hotel',
  'Houseboat',
  'Minsu',
  'Riad',
  'Ryokan',
  "Shepherd's hut",
  'Tent',
  'Tiny home',
  'Tower',
  'Tree house',
  'Trullo',
  'Windmill',
] as const
export type StructureType = (typeof STRUCTURE_TYPES)[number]

export const PRIVACY_TYPES = [
  { value: 'entire', label: 'An entire place', description: 'Guests have the whole place to themselves.' },
  { value: 'room', label: 'A room', description: 'Guests have their own room in a home, plus access to shared spaces.' },
  { value: 'shared', label: 'A shared room in a hostel', description: 'Guests sleep in a shared room in a professionally managed hostel with staff on-site 24/7.' },
] as const
export type PrivacyType = (typeof PRIVACY_TYPES)[number]['value']

export interface Property {
  id: string
  title: string
  propertyType: PropertyType
  city: string
  state: string
  neighborhood: string
  address: string
  price: number
  deposit: number
  maxGuests: number
  minStayNights: number
  roomSizeSqft: number
  tenantPreference: TenantPreference
  amenities: string[]
  images: string[]
  verified: boolean
  furnished: boolean
  rating: number
  reviewCount: number
  description: string
  ownerName: string
  ownerPhone: string
  hostResponseTime: string
  hostBio: string
  hostResponseRate: number
  hostJoinedYear: number
  hostTotalListings: number
  hostLanguages: string[]
  wifiSpeedMbps: number
  freeCancellation: boolean
  instantBook: boolean
  availabilityStatus: AvailabilityStatus
  lifestyleTags: LifestyleTag[]
  landmarks: { name: string; type: LandmarkType; distanceM: number; walkMin: number }[]
  ratingBreakdown: { label: string; score: number }[]
  reviews: {
    id: string
    name: string
    avatar: string
    occupation: string
    verifiedStay: boolean
    wouldRecommend: boolean
    helpfulVotes: number
    date: string
    text: string
  }[]
}

export interface Lead {
  id: string
  propertyId: string
  propertyTitle: string
  name: string
  phone: string
  visitDate: string
  createdAt: string
}

export type UserRole = 'tenant' | 'host'

export interface AuthUser {
  name: string
  email: string
  role: UserRole
  phone?: string
  avatarUrl?: string
}
