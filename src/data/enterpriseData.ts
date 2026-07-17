export type ModuleKey = 'pms' | 'booking' | 'fnb' | 'analytics'

export const MODULES: { key: ModuleKey; label: string; blurb: string }[] = [
  { key: 'pms', label: 'Property Management', blurb: 'Rooms, housekeeping, and staff — all in one operational grid.' },
  { key: 'booking', label: 'Booking Engine', blurb: 'Commission-free direct bookings with real-time rate sync.' },
  { key: 'fnb', label: 'F&B POS', blurb: 'Restaurant and room-service billing that posts straight to folios.' },
  { key: 'analytics', label: 'Analytics', blurb: 'Occupancy, ADR, and RevPAR trends the moment they happen.' },
]

export interface Room {
  id: string
  label: string
  floor: number
}

export interface Reservation {
  id: string
  roomId: string
  guestName: string
  startDay: number // 0-indexed offset from the timeline start
  nights: number
  status: 'confirmed' | 'checked-in' | 'checkout-today'
}

export const TIMELINE_DAYS = 10

export const ROOMS: Room[] = [
  { id: '101', label: 'Room 101', floor: 1 },
  { id: '102', label: 'Room 102', floor: 1 },
  { id: '103', label: 'Room 103', floor: 1 },
  { id: '201', label: 'Room 201', floor: 2 },
  { id: '202', label: 'Room 202', floor: 2 },
  { id: '203', label: 'Room 203', floor: 2 },
  { id: '301', label: 'Room 301', floor: 3 },
  { id: '302', label: 'Room 302', floor: 3 },
]

export const RESERVATIONS: Reservation[] = [
  { id: 'res1', roomId: '101', guestName: 'A. Kapoor', startDay: 0, nights: 3, status: 'checked-in' },
  { id: 'res2', roomId: '101', guestName: 'R. Sharma', startDay: 4, nights: 2, status: 'confirmed' },
  { id: 'res3', roomId: '102', guestName: 'M. Iyer', startDay: 1, nights: 4, status: 'checked-in' },
  { id: 'res4', roomId: '103', guestName: 'S. Fernandes', startDay: 0, nights: 1, status: 'checkout-today' },
  { id: 'res5', roomId: '103', guestName: 'V. Rao', startDay: 2, nights: 3, status: 'confirmed' },
  { id: 'res6', roomId: '201', guestName: 'K. Nair', startDay: 3, nights: 5, status: 'confirmed' },
  { id: 'res7', roomId: '202', guestName: 'D. Gupta', startDay: 0, nights: 2, status: 'checked-in' },
  { id: 'res8', roomId: '203', guestName: 'P. Mehta', startDay: 5, nights: 3, status: 'confirmed' },
  { id: 'res9', roomId: '301', guestName: 'N. Singh', startDay: 1, nights: 2, status: 'checked-in' },
  { id: 'res10', roomId: '302', guestName: 'J. Reddy', startDay: 6, nights: 4, status: 'confirmed' },
]

export const UPCOMING_ARRIVALS = [
  { name: 'Rohit Sharma', room: '101', time: '2:00 PM', nights: 2, source: 'Direct' },
  { name: 'Priya Menon', room: '203', time: '3:30 PM', nights: 3, source: 'Booking Engine' },
  { name: 'James Wu', room: '302', time: '4:00 PM', nights: 4, source: 'OTA' },
  { name: 'Ayesha Khan', room: '201', time: '6:15 PM', nights: 5, source: 'Direct' },
]

export const OCCUPANCY_TREND = [62, 58, 65, 71, 69, 75, 82, 78, 85, 88, 84, 90]
