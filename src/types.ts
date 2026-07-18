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
export type LandmarkType = 'Metro' | 'Gym' | 'Restaurant' | 'Hospital' | 'Market' | 'College' | 'Mall' | 'Beach' | 'Temple' | 'Airport' | 'Office' | 'Attraction'

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
}
