import type { Property, PropertyType } from '../types'

export interface ProgrammaticPageConfig {
  path: string
  destinationSlug: string
  destinationName: string
  city: string
  label: string
  h1: string
  intro: string
  predicate: (p: Property) => boolean
}

/** Example Programmatic SEO pages — the pattern to scale later: a page is
 * just {path, a city filter, a property-type/amenity predicate, and some
 * intro copy}. Rendering is fully generic (ProgrammaticListingPage.tsx);
 * scaling to hundreds of combinations means adding rows here (or generating
 * them from destinations.ts × PROPERTY_TYPES at build time) — NOT adding a
 * fully open `/:destination/:type` catch-all route, which would create thin
 * duplicate pages for combinations with zero matching properties. Keep this
 * an explicit, sitemap-controlled allow-list as it grows. */
const villaTypes: PropertyType[] = ['Villas']
const cabinTypes: PropertyType[] = ['Cabins']
const cottageTypes: PropertyType[] = ['Cottages']
const farmhouseTypes: PropertyType[] = ['Farm Stays', 'Country Houses']

export const PROGRAMMATIC_PAGES: ProgrammaticPageConfig[] = [
  {
    path: '/goa/villas',
    destinationSlug: 'goa',
    destinationName: 'Goa',
    city: 'Goa',
    label: 'Villas in Goa',
    h1: 'Villas for Rent in Goa',
    intro: 'Private villas across North and South Goa, from beachside gardens to secluded pools — verified, photographed, and bookable by the night.',
    predicate: (p) => p.city === 'Goa' && villaTypes.includes(p.propertyType),
  },
  {
    path: '/goa/beachfront-villas',
    destinationSlug: 'goa',
    destinationName: 'Goa',
    city: 'Goa',
    label: 'Beachfront Villas in Goa',
    h1: 'Beachfront Villas in Goa',
    intro: 'Goa villas within easy walking distance of the beach — ideal for travelers who want the sand a few minutes from the front door.',
    predicate: (p) => p.city === 'Goa' && villaTypes.includes(p.propertyType) && p.landmarks.some((l) => l.type === 'Beach' && l.distanceM <= 1000),
  },
  {
    path: '/manali/cabins',
    destinationSlug: 'manali',
    destinationName: 'Manali',
    city: 'Manali',
    label: 'Cabins in Manali',
    h1: 'Cabins & Cottages for Rent in Manali',
    intro: 'Wood cabins and riverside cottages around Old Manali and the Kullu valley, with mountain views and bonfire evenings.',
    predicate: (p) => p.city === 'Manali' && (cabinTypes.includes(p.propertyType) || cottageTypes.includes(p.propertyType)),
  },
  {
    path: '/shimla/cottages',
    destinationSlug: 'shimla',
    destinationName: 'Shimla',
    city: 'Shimla',
    label: 'Cottages in Shimla',
    h1: 'Cottages & Cabins for Rent in Shimla',
    intro: 'Pine-forest cabins around Kufri and the Shimla outskirts, away from the Mall Road crowds — fireplaces and deodar views included.',
    predicate: (p) => p.city === 'Shimla' && (cottageTypes.includes(p.propertyType) || cabinTypes.includes(p.propertyType)),
  },
  {
    path: '/lonavala/private-pool-villas',
    destinationSlug: 'lonavala',
    destinationName: 'Lonavala',
    city: 'Lonavala',
    label: 'Private Pool Villas in Lonavala',
    h1: 'Private Pool Villas in Lonavala',
    intro: 'Lonavala villas with a private pool — the classic Mumbai/Pune weekend escape, especially spectacular in monsoon season.',
    predicate: (p) => p.city === 'Lonavala' && villaTypes.includes(p.propertyType) && p.amenities.includes('Pool'),
  },
  {
    path: '/jaipur/farmhouses',
    destinationSlug: 'jaipur',
    destinationName: 'Jaipur',
    city: 'Jaipur',
    label: 'Farmhouses near Jaipur',
    h1: 'Farmhouses for Rent near Jaipur',
    intro: 'Spacious farmhouses on the outskirts of Jaipur, built for group getaways and family reunions with open lawns and Rajasthani hospitality.',
    predicate: (p) => p.city === 'Jaipur' && farmhouseTypes.includes(p.propertyType),
  },
]

export function getProgrammaticPage(path: string) {
  return PROGRAMMATIC_PAGES.find((c) => c.path === path)
}
