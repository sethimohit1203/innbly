export type TenantPreference = 'Boys' | 'Girls' | 'Family' | 'Anyone'

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
  landmarks: { name: string; distanceM: number; walkMin: number }[]
  ratingBreakdown: { label: string; score: number }[]
  reviews: {
    id: string
    name: string
    avatar: string
    verifiedStay: boolean
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
