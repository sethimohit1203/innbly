import type { ApiRequest, ApiResponse } from '../_lib/http'
import { getClientIp, readJsonBody } from '../_lib/http'
import { rateLimit } from '../_lib/rateLimit'

/**
 * Razorpay order creation scaffold. Disabled until RAZORPAY_KEY_ID and
 * RAZORPAY_KEY_SECRET are set in the environment — generate free test-mode
 * keys at https://dashboard.razorpay.com/app/keys (no business verification
 * needed to start testing). Nothing here fabricates a successful payment;
 * it simply won't run without real credentials.
 */
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
  const limit = rateLimit(`payments:${ip}`, 10, 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many requests.' })
    return
  }

  const body = readJsonBody<{ amountInPaise?: number; receipt?: string }>(req)
  if (!body.amountInPaise || body.amountInPaise <= 0) {
    res.status(400).json({ error: 'amountInPaise must be a positive integer' })
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
        amount: Math.round(body.amountInPaise),
        currency: 'INR',
        receipt: body.receipt ?? `innbly_${Date.now()}`,
      }),
    })

    if (!order.ok) {
      const errText = await order.text()
      res.status(502).json({ error: `Razorpay order creation failed: ${errText}` })
      return
    }

    const data = await order.json()
    res.status(200).json({ orderId: data.id, amount: data.amount, currency: data.currency, keyId })
  } catch (err) {
    res.status(502).json({ error: `Could not reach Razorpay: ${(err as Error).message}` })
  }
}
