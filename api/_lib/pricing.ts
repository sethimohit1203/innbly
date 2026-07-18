import { properties } from '../../src/data/properties'

/** Authoritative pricing — the client only ever sends selections (room type,
 * add-ons, nights); every rupee amount shown to a user is computed here so
 * nothing can be tampered with in the browser. */

export const ESTIMATOR_BASE_PRICES: Record<'Single' | 'Double' | 'Triple', number> = {
  Single: 15000,
  Double: 9000,
  Triple: 7000,
}

export const ADDON_PRICES = {
  meals: 2500,
  ac: 1500,
}

export interface EstimatorInput {
  roomType: 'Single' | 'Double' | 'Triple'
  meals: boolean
  ac: boolean
}

export function computeEstimatorTotal(input: EstimatorInput) {
  const baseRent = ESTIMATOR_BASE_PRICES[input.roomType] ?? ESTIMATOR_BASE_PRICES.Single
  const mealRent = input.meals ? ADDON_PRICES.meals : 0
  const acRent = input.ac ? ADDON_PRICES.ac : 0
  const totalMonthly = baseRent + mealRent + acRent
  return { baseRent, mealRent, acRent, totalMonthly, securityDeposit: totalMonthly }
}

export interface BookingInput {
  propertyId: string
  nights: number
  meals: boolean
  ac: boolean
}

const NIGHTLY_ADDON_PRICES = {
  meals: 500,
  ac: 300,
}

export function computeBookingTotal(input: BookingInput) {
  const property = properties.find((p) => p.id === input.propertyId)
  if (!property) return null

  const nights = Math.min(30, Math.max(1, Math.round(input.nights)))
  const nightlyRate = property.price
  const roomTotal = nightlyRate * nights
  const mealsCost = input.meals ? NIGHTLY_ADDON_PRICES.meals * nights : 0
  const acCost = input.ac ? NIGHTLY_ADDON_PRICES.ac * nights : 0
  const total = roomTotal + mealsCost + acCost

  return {
    propertyId: property.id,
    propertyTitle: property.title,
    nights,
    nightlyRate,
    roomTotal,
    mealsCost,
    acCost,
    total,
  }
}

export interface CalendarInput {
  propertyId: string
}

// Deterministic weekend markup so the 7-day preview is stable, not randomized.
const DAY_MULTIPLIERS = [1.05, 1, 1, 1, 1, 1.15, 1.3] // Sun, Mon, Tue, Wed, Thu, Fri, Sat

export function computeWeeklyCalendar(input: CalendarInput) {
  const property = properties.find((p) => p.id === input.propertyId)
  if (!property) return null

  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const price = Math.round((property.price * DAY_MULTIPLIERS[d.getDay()]) / 10) * 10
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      price,
    })
  }
  return { propertyId: property.id, days }
}

export interface RoiInput {
  rooms: number
}

export function computeRoiEstimate(input: RoiInput) {
  const rooms = Math.min(1000, Math.max(1, Math.round(input.rooms)))
  const adminHoursSaved = Math.round(rooms * 0.9)
  const revenueIncrease = Math.round(rooms * 6200 * 0.08)
  return { rooms, adminHoursSaved, revenueIncrease }
}
