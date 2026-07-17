import type { Property } from '../types'

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Sunrise Coliving — Koramangala',
    city: 'Bengaluru',
    neighborhood: 'Koramangala',
    address: '5th Block, Koramangala, Bengaluru',
    price: 12500,
    deposit: 25000,
    roomType: 'Sharing',
    tenantPreference: 'Anyone',
    amenities: ['Wi-Fi', 'AC', 'Attached Bath', 'Power Backup', 'Housekeeping', 'Meals', 'Laundry', 'CCTV'],
    images: [img('sunrise1'), img('sunrise2'), img('sunrise3'), img('sunrise4'), img('sunrise5')],
    verified: true,
    furnished: true,
    rating: 4.8,
    reviewCount: 142,
    description:
      'A bright, fully-furnished coliving space in the heart of Koramangala, walking distance from cafes, tech parks, and the metro. Designed for young professionals who want comfort without the hassle of managing a household. Daily housekeeping, high-speed Wi-Fi, and a community lounge make this one of the most sought-after stays in the neighborhood. Includes weekly linen change and 24x7 security.',
    ownerName: 'Rahul Mehta',
    ownerPhone: '+919876543210',
    landmarks: [
      { name: 'Koramangala Metro Station', distanceM: 400, walkMin: 5 },
      { name: 'Forum Mall', distanceM: 650, walkMin: 8 },
      { name: 'Sarjapur Tech Park', distanceM: 1800, walkMin: 22 },
      { name: 'St. John\'s Hospital', distanceM: 900, walkMin: 11 },
    ],
    ratingBreakdown: [
      { label: 'Cleanliness', score: 4.9 },
      { label: 'Location', score: 4.8 },
      { label: 'Food Quality', score: 4.5 },
      { label: 'Host Behavior', score: 4.9 },
    ],
    reviews: [
      { id: 'r1', name: 'Ananya S.', avatar: img('ananya', 100, 100), verifiedStay: true, date: '2026-05-12', text: 'Super clean rooms and the host is very responsive. Food is home-style and genuinely good.' },
      { id: 'r2', name: 'Vikram R.', avatar: img('vikram', 100, 100), verifiedStay: true, date: '2026-04-02', text: 'Great location, close to everything. Wi-Fi is fast and reliable for WFH.' },
      { id: 'r3', name: 'Priya K.', avatar: img('priya', 100, 100), verifiedStay: false, date: '2026-03-18', text: 'Visited for a tour, place looked well maintained and staff was helpful.' },
    ],
  },
  {
    id: 'p2',
    title: 'Green Nest PG — Andheri West',
    city: 'Mumbai',
    neighborhood: 'Andheri West',
    address: 'Lokhandwala Complex, Andheri West, Mumbai',
    price: 9800,
    deposit: 15000,
    roomType: 'Single',
    tenantPreference: 'Girls',
    amenities: ['Wi-Fi', 'AC', 'Power Backup', 'Meals', 'CCTV', 'Housekeeping'],
    images: [img('green1'), img('green2'), img('green3'), img('green4'), img('green5')],
    verified: true,
    furnished: true,
    rating: 4.6,
    reviewCount: 88,
    description:
      'A safe, women-only PG in Lokhandwala with 24x7 security and CCTV surveillance. Single occupancy rooms with attached storage, daily home-cooked meals, and a dedicated study area. Close to Andheri station and the Western Express Highway for easy commutes across the city.',
    ownerName: 'Sunita Shah',
    ownerPhone: '+919812345678',
    landmarks: [
      { name: 'Andheri Station', distanceM: 1200, walkMin: 15 },
      { name: 'Infinity Mall', distanceM: 500, walkMin: 6 },
      { name: 'Lokhandwala Market', distanceM: 300, walkMin: 4 },
    ],
    ratingBreakdown: [
      { label: 'Cleanliness', score: 4.7 },
      { label: 'Location', score: 4.4 },
      { label: 'Food Quality', score: 4.6 },
      { label: 'Host Behavior', score: 4.8 },
    ],
    reviews: [
      { id: 'r1', name: 'Meera T.', avatar: img('meera', 100, 100), verifiedStay: true, date: '2026-06-01', text: 'Feels very safe, warden is strict but caring. Food quality is consistently good.' },
      { id: 'r2', name: 'Kavya N.', avatar: img('kavya', 100, 100), verifiedStay: true, date: '2026-02-14', text: 'Compact rooms but everything I need is here. Great value for money.' },
    ],
  },
  {
    id: 'p3',
    title: 'Urban Stay Homes — Hitech City',
    city: 'Hyderabad',
    neighborhood: 'Hitech City',
    address: 'Madhapur, Hitech City, Hyderabad',
    price: 14000,
    deposit: 28000,
    roomType: 'Single',
    tenantPreference: 'Boys',
    amenities: ['Wi-Fi', 'AC', 'Attached Bath', 'Power Backup', 'Gym', 'Housekeeping', 'Parking'],
    images: [img('urban1'), img('urban2'), img('urban3'), img('urban4'), img('urban5')],
    verified: true,
    furnished: true,
    rating: 4.7,
    reviewCount: 63,
    description:
      'Premium single-occupancy rooms designed for working professionals in the IT corridor. On-site gym, dedicated parking, and a rooftop lounge. Fully furnished with a work desk, wardrobe, and high-speed fiber internet — ideal for a comfortable long-term stay near major tech campuses.',
    ownerName: 'Arjun Reddy',
    ownerPhone: '+919845098450',
    landmarks: [
      { name: 'Hitech City Metro', distanceM: 700, walkMin: 9 },
      { name: 'Inorbit Mall', distanceM: 1100, walkMin: 14 },
      { name: 'Cyber Towers', distanceM: 450, walkMin: 6 },
    ],
    ratingBreakdown: [
      { label: 'Cleanliness', score: 4.6 },
      { label: 'Location', score: 4.9 },
      { label: 'Food Quality', score: 4.3 },
      { label: 'Host Behavior', score: 4.8 },
    ],
    reviews: [
      { id: 'r1', name: 'Sandeep V.', avatar: img('sandeep', 100, 100), verifiedStay: true, date: '2026-05-20', text: 'Best PG I have stayed in — gym and parking make a huge difference.' },
    ],
  },
  {
    id: 'p4',
    title: 'Comfort Homes — Sector 62 Noida',
    city: 'Noida',
    neighborhood: 'Sector 62',
    address: 'Sector 62, Noida',
    price: 8200,
    deposit: 12000,
    roomType: 'Sharing',
    tenantPreference: 'Family',
    amenities: ['Wi-Fi', 'Power Backup', 'Meals', 'Housekeeping', 'Parking'],
    images: [img('comfort1'), img('comfort2'), img('comfort3'), img('comfort4'), img('comfort5')],
    verified: false,
    furnished: true,
    rating: 4.3,
    reviewCount: 34,
    description:
      'Family-friendly shared accommodation close to major IT parks in Sector 62. Spacious rooms, home-style meals, and a quiet residential setting. Great option for small families or professionals relocating with dependents.',
    ownerName: 'Deepak Gupta',
    ownerPhone: '+919990011223',
    landmarks: [
      { name: 'Sector 62 Metro', distanceM: 850, walkMin: 10 },
      { name: 'DLF Towers', distanceM: 600, walkMin: 8 },
    ],
    ratingBreakdown: [
      { label: 'Cleanliness', score: 4.2 },
      { label: 'Location', score: 4.5 },
      { label: 'Food Quality', score: 4.1 },
      { label: 'Host Behavior', score: 4.4 },
    ],
    reviews: [
      { id: 'r1', name: 'Nisha B.', avatar: img('nisha', 100, 100), verifiedStay: true, date: '2026-01-11', text: 'Good for families, quiet locality and helpful host.' },
    ],
  },
]

export function getPropertyById(id: string) {
  return properties.find((p) => p.id === id)
}
