import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { getClientIp, readJsonBody } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { computeEstimatorTotal, computeBookingTotal, computeRoiEstimate, computeWeeklyCalendar } from './_lib/pricing.js'

interface PriceRequest {
  kind: 'estimator' | 'booking' | 'roi' | 'calendar'
  roomType?: 'Single' | 'Double' | 'Triple'
  meals?: boolean
  ac?: boolean
  propertyId?: string
  nights?: number
  rooms?: number
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`price:${ip}`, 120, 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many requests.' })
    return
  }

  const body = readJsonBody<PriceRequest>(req)

  if (body.kind === 'estimator') {
    const result = computeEstimatorTotal({
      roomType: body.roomType ?? 'Single',
      meals: Boolean(body.meals),
      ac: Boolean(body.ac),
    })
    res.status(200).json(result)
    return
  }

  if (body.kind === 'booking') {
    if (!body.propertyId) {
      res.status(400).json({ error: 'propertyId is required' })
      return
    }
    const result = computeBookingTotal({
      propertyId: body.propertyId,
      nights: body.nights ?? 1,
      meals: Boolean(body.meals),
      ac: Boolean(body.ac),
    })
    if (!result) {
      res.status(404).json({ error: 'Property not found' })
      return
    }
    res.status(200).json(result)
    return
  }

  if (body.kind === 'calendar') {
    if (!body.propertyId) {
      res.status(400).json({ error: 'propertyId is required' })
      return
    }
    const result = computeWeeklyCalendar({ propertyId: body.propertyId })
    if (!result) {
      res.status(404).json({ error: 'Property not found' })
      return
    }
    res.status(200).json(result)
    return
  }

  if (body.kind === 'roi') {
    const result = computeRoiEstimate({ rooms: body.rooms ?? 40 })
    res.status(200).json(result)
    return
  }

  res.status(400).json({ error: 'Unknown price request kind' })
}
