import type { Property } from '../types'

export interface QuickFilter {
  slug: string
  label: string
  predicate: (p: Property) => boolean
}

const ENTIRE_HOME_TYPES = ['Villas', 'Homestays', 'Farm Stays', 'Country Houses', 'Cottages']
const WEEKEND_TYPES = ['Villas', 'Farm Stays', 'Cottages', 'Country Houses']

export const QUICK_FILTERS: QuickFilter[] = [
  { slug: 'near-metro', label: 'Near Metro', predicate: (p) => p.landmarks.some((l) => l.type === 'Metro' && l.distanceM <= 1000) },
  { slug: 'work-friendly', label: 'Work Friendly', predicate: (p) => p.lifestyleTags.includes('Digital Nomad') || p.wifiSpeedMbps >= 100 },
  { slug: 'entire-home', label: 'Entire Home', predicate: (p) => ENTIRE_HOME_TYPES.includes(p.propertyType) },
  { slug: 'family-stay', label: 'Family Stay', predicate: (p) => p.lifestyleTags.includes('Family') },
  { slug: 'under-2000', label: 'Under ₹2000', predicate: (p) => p.price < 2000 },
  { slug: 'pet-friendly', label: 'Pet Friendly', predicate: (p) => p.lifestyleTags.includes('Pet Friendly') },
  { slug: 'high-speed-wifi', label: 'High Speed WiFi', predicate: (p) => p.wifiSpeedMbps >= 100 },
  { slug: 'pool', label: 'Pool', predicate: (p) => p.amenities.includes('Pool') },
  { slug: 'parking', label: 'Parking', predicate: (p) => p.amenities.includes('Parking') },
  { slug: 'luxury', label: 'Luxury', predicate: (p) => p.price >= 3500 },
  { slug: 'executive', label: 'Executive', predicate: (p) => p.lifestyleTags.includes('Corporate') },
  { slug: 'mountain-nature', label: 'Mountain & Nature', predicate: (p) => p.propertyType === 'Farm Stays' },
  { slug: 'beach', label: 'Beach', predicate: (p) => p.city === 'Goa' },
  { slug: 'couples', label: 'Couples', predicate: (p) => p.lifestyleTags.includes('Couple') },
  { slug: 'weekend', label: 'Weekend Getaway', predicate: (p) => WEEKEND_TYPES.includes(p.propertyType) },
  { slug: 'top-rated', label: 'Top Rated', predicate: (p) => p.rating >= 4.7 },
  { slug: 'most-loved', label: 'Most Loved', predicate: (p) => p.reviewCount >= 50 },
  { slug: 'budget-picks', label: 'Budget Picks', predicate: (p) => p.price < 1300 },
  { slug: 'new-listings', label: 'New Listings', predicate: (p) => p.hostJoinedYear >= 2022 },
  { slug: 'corporate', label: 'Corporate', predicate: (p) => p.lifestyleTags.includes('Corporate') },
  { slug: 'digital-nomad', label: 'Digital Nomad', predicate: (p) => p.lifestyleTags.includes('Digital Nomad') },
  { slug: 'senior-friendly', label: 'Senior Friendly', predicate: (p) => p.lifestyleTags.includes('Senior Friendly') },
  { slug: 'backpacker', label: 'Backpacker', predicate: (p) => p.lifestyleTags.includes('Backpacker') },
]

export function getQuickFilter(slug: string | null): QuickFilter | undefined {
  return QUICK_FILTERS.find((f) => f.slug === slug)
}
