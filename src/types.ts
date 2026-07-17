export type TenantPreference = 'Boys' | 'Girls' | 'Family' | 'Anyone'
export type RoomType = 'Single' | 'Sharing'

export interface Property {
  id: string
  title: string
  city: string
  neighborhood: string
  address: string
  price: number
  deposit: number
  roomType: RoomType
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
