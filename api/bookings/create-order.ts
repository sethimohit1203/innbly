import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { getClientIp, readJsonBody } from '../_lib/http.js'
import { rateLimit } from '../_lib/rateLimit.js'
import { computeStayBookingBreakdown } from '../_lib/stayBooking.js'

interface CreateOrderBody {
  propertyId?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    res.status(501).json({ error: 'Payments are not configured for this deployment yet.' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`bookings-create:${ip}`, 10, 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' })
    return
  }

  const body = readJsonBody<CreateOrderBody>(req)
  if (!body.propertyId || !body.checkIn || !body.checkOut || !body.guests) {
    res.status(400).json({ error: 'propertyId, checkIn, checkOut, and guests are required.' })
    return
  }

  const breakdown = await computeStayBookingBreakdown({
    propertyId: body.propertyId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    guests: body.guests,
  })

  if (!breakdown) {
    res.status(404).json({ error: 'Property not found.' })
    return
  }
  if ('error' in breakdown) {
    res.status(400).json({ error: breakdown.error })
    return
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const order = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(breakdown.guestTotal * 100),
        currency: 'INR',
        receipt: `innbly_${Date.now()}`,
      }),
    })

    if (!order.ok) {
      const errText = await order.text()
      res.status(502).json({ error: `Razorpay order creation failed: ${errText}` })
      return
    }

    const data = await order.json()
    res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
      breakdown,
    })
  } catch (err) {
    res.status(502).json({ error: `Could not reach Razorpay: ${(err as Error).message}` })
  }
}
