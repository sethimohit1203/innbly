import type { Property } from '../types'

export interface QuickFilter {
  slug: string
  label: string
  predicate: (p: Property) => boolean
  /** Tier A collections have clear standalone search intent and get their
   * own indexable landing page (unique title/description, self-referencing
   * canonical to `/search?collection=<slug>`). Tier B are narrower/
   * operational filters that stay useful as on-site filter chips but
   * canonicalize back to the base `/search` page rather than competing for
   * their own indexed URL — see SITE-STRUCTURE.md's "Domain / Canonical
   * Structure" section for the reasoning behind this split. */
  tier: 'A' | 'B'
  /** SEO title/description for Tier A collection landing pages. */
  seoTitle?: string
  seoDescription?: string
}

const ENTIRE_HOME_TYPES = ['Villas', 'Homestays', 'Farm Stays', 'Country Houses', 'Cottages']
const WEEKEND_TYPES = ['Villas', 'Farm Stays', 'Cottages', 'Country Houses']

export const QUICK_FILTERS: QuickFilter[] = [
  { slug: 'near-metro', label: 'Near Metro', tier: 'B', predicate: (p) => p.landmarks.some((l) => l.type === 'Metro' && l.distanceM <= 1000) },
  {
    slug: 'work-friendly',
    label: 'Work Friendly',
    tier: 'A',
    predicate: (p) => p.lifestyleTags.includes('Digital Nomad') || p.wifiSpeedMbps >= 100,
    seoTitle: 'Work-Friendly Villas & Stays with High-Speed WiFi',
    seoDescription: 'Verified vacation rentals in India with fast WiFi and dedicated workspace, ideal for remote work and workations. Book directly on Innbly.',
  },
  { slug: 'entire-home', label: 'Entire Home', tier: 'B', predicate: (p) => ENTIRE_HOME_TYPES.includes(p.propertyType) },
  {
    slug: 'family-stay',
    label: 'Family Stay',
    tier: 'A',
    predicate: (p) => p.lifestyleTags.includes('Family'),
    seoTitle: 'Family-Friendly Villas & Holiday Homes in India',
    seoDescription: 'Spacious, verified vacation rentals in India suited for family trips — villas, cottages and farmhouses with room for everyone. Book directly on Innbly.',
  },
  { slug: 'under-2000', label: 'Under ₹2000', tier: 'B', predicate: (p) => p.price <= 2000 },
  {
    slug: 'pet-friendly',
    label: 'Pet Friendly',
    tier: 'A',
    predicate: (p) => p.lifestyleTags.includes('Pet Friendly'),
    seoTitle: 'Pet-Friendly Villas & Vacation Rentals in India',
    seoDescription: 'Bring your pet along — verified pet-friendly villas, cottages and holiday homes across India’s top getaway destinations. Book directly on Innbly.',
  },
  { slug: 'high-speed-wifi', label: 'High Speed WiFi', tier: 'B', predicate: (p) => p.wifiSpeedMbps >= 100 },
  {
    slug: 'pool',
    label: 'Pool',
    tier: 'A',
    predicate: (p) => p.amenities.includes('Pool'),
    seoTitle: 'Private Pool Villas & Vacation Rentals in India',
    seoDescription: 'Verified villas and holiday homes with a private pool across India’s top getaway destinations. Transparent pricing, real hosts. Book directly on Innbly.',
  },
  { slug: 'parking', label: 'Parking', tier: 'B', predicate: (p) => p.amenities.includes('Parking') },
  {
    slug: 'luxury',
    label: 'Luxury',
    tier: 'A',
    predicate: (p) => p.price >= 3500,
    seoTitle: 'Luxury Villas & Premium Vacation Rentals in India',
    seoDescription: 'Handpicked luxury villas and premium holiday homes across India, verified and transparently priced. Book directly on Innbly.',
  },
  { slug: 'executive', label: 'Executive', tier: 'B', predicate: (p) => p.lifestyleTags.includes('Corporate') },
  { slug: 'mountain-nature', label: 'Mountain & Nature', tier: 'B', predicate: (p) => p.propertyType === 'Farm Stays' },
  {
    slug: 'beach',
    label: 'Beach',
    tier: 'A',
    predicate: (p) => p.city === 'Goa',
    seoTitle: 'Beach Villas & Vacation Rentals in Goa',
    seoDescription: 'Verified beach villas and holiday homes in Goa with transparent pricing and real hosts. Book your beach getaway directly on Innbly.',
  },
  { slug: 'couples', label: 'Couples', tier: 'B', predicate: (p) => p.lifestyleTags.includes('Couple') },
  {
    slug: 'weekend',
    label: 'Weekend Getaway',
    tier: 'A',
    predicate: (p) => WEEKEND_TYPES.includes(p.propertyType),
    seoTitle: 'Weekend Getaway Villas & Vacation Homes Near You',
    seoDescription: 'Verified villas, cottages and farmhouses perfect for a quick weekend getaway across India’s top destinations. Book directly on Innbly.',
  },
  { slug: 'top-rated', label: 'Top Rated', tier: 'B', predicate: (p) => p.rating >= 4.7 },
  { slug: 'most-loved', label: 'Most Loved', tier: 'B', predicate: (p) => p.reviewCount >= 50 },
  {
    slug: 'budget-picks',
    label: 'Budget Picks',
    tier: 'A',
    predicate: (p) => p.price < 1300,
    seoTitle: 'Budget Villas & Affordable Vacation Rentals in India',
    seoDescription: 'Affordable, verified vacation rentals across India’s top getaway destinations — transparent pricing, no hidden fees. Book directly on Innbly.',
  },
  { slug: 'new-listings', label: 'New Listings', tier: 'B', predicate: (p) => p.hostJoinedYear >= 2022 },
  { slug: 'corporate', label: 'Corporate', tier: 'B', predicate: (p) => p.lifestyleTags.includes('Corporate') },
  { slug: 'digital-nomad', label: 'Digital Nomad', tier: 'B', predicate: (p) => p.lifestyleTags.includes('Digital Nomad') },
  { slug: 'senior-friendly', label: 'Senior Friendly', tier: 'B', predicate: (p) => p.lifestyleTags.includes('Senior Friendly') },
  { slug: 'backpacker', label: 'Backpacker', tier: 'B', predicate: (p) => p.lifestyleTags.includes('Backpacker') },
]

export function getQuickFilter(slug: string | null): QuickFilter | undefined {
  return QUICK_FILTERS.find((f) => f.slug === slug)
}
