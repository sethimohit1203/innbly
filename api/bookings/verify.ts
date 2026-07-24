import { createHmac, timingSafeEqual } from 'node:crypto'
import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { getClientIp, readJsonBody } from '../_lib/http.js'
import { rateLimit } from '../_lib/rateLimit.js'
import { computeStayBookingBreakdown } from '../_lib/stayBooking.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { forwardToSheet } from '../_lib/sheets.js'

interface VerifyBody {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  propertyId?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  tenantName?: string
  tenantEmail?: string
  tenantPhone?: string
}

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    res.status(501).json({ error: 'Payments are not configured for this deployment yet.' })
    return
  }

  const ip = getClientIp(req)
  const limit = rateLimit(`bookings-verify:${ip}`, 10, 60 * 1000)
  if (!limit.allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' })
    return
  }

  const body = readJsonBody<VerifyBody>(req)
  if (
    !body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature ||
    !body.propertyId || !body.checkIn || !body.checkOut || !body.guests ||
    !body.tenantName || !body.tenantEmail || !body.tenantPhone
  ) {
    res.status(400).json({ error: 'Missing required booking/payment fields.' })
    return
  }

  const signatureValid = verifySignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature, keySecret)
  if (!signatureValid) {
    res.status(400).json({ error: 'Payment could not be verified. Please contact support before trying again.' })
    return
  }

  // Never trust the client for the amount charged — recompute the exact
  // same breakdown server-side used to create the order in the first place.
  const breakdown = await computeStayBookingBreakdown({
    propertyId: body.propertyId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    guests: body.guests,
  })
  if (!breakdown || 'error' in breakdown) {
    res.status(400).json({ error: 'Could not re-verify booking details.' })
    return
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  // Idempotency guard — if the client retries this call (e.g. a flaky
  // connection re-sending the same successful payment), don't insert a
  // second booking row or send duplicate emails for the same payment.
  const { data: existing } = await admin
    .from('bookings')
    .select('id')
    .eq('razorpay_payment_id', body.razorpay_payment_id)
    .maybeSingle()
  if (existing) {
    res.status(200).json({ ok: true, bookingId: existing.id, breakdown })
    return
  }

  // For a host-submitted listing, look up the host's contact details
  // (including owner_email, deliberately excluded from the public
  // approved_listings view) so the admin payout screen has someone to pay.
  let hostName: string | null = null
  let hostEmail: string | null = null
  let hostPhone: string | null = null
  if (body.propertyId.startsWith('host-')) {
    const rawId = body.propertyId.replace('host-', '')
    const { data } = await admin
      .from('host_submissions')
      .select('owner_name, owner_email, owner_phone')
      .eq('id', rawId)
      .maybeSingle()
    if (data) {
      hostName = data.owner_name
      hostEmail = data.owner_email
      hostPhone = data.owner_phone
    }
  }

  const { data: inserted, error } = await admin
    .from('bookings')
    .insert({
      property_id: breakdown.propertyId,
      property_title: breakdown.propertyTitle,
      host_name: hostName,
      host_email: hostEmail,
      host_phone: hostPhone,
      tenant_name: body.tenantName,
      tenant_email: body.tenantEmail,
      tenant_phone: body.tenantPhone,
      check_in: body.checkIn,
      check_out: body.checkOut,
      nights: breakdown.nights,
      guests: body.guests,
      nightly_rate: breakdown.nightlyRate,
      room_subtotal: breakdown.roomSubtotal,
      guest_service_fee: breakdown.guestServiceFee,
      gst_amount: breakdown.gstAmount,
      security_deposit: breakdown.securityDeposit,
      guest_total: breakdown.guestTotal,
      host_commission: breakdown.hostCommission,
      host_payout_amount: breakdown.hostPayoutAmount,
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
    })
    .select('id')
    .single()

  if (error) {
    res.status(502).json({ error: error.message })
    return
  }

  // Best-effort mirror + email notification (admin + host, if configured) —
  // the booking is already durably saved in Supabase above, so a Sheets/
  // email hiccup here shouldn't fail the checkout the tenant already sees
  // as successful.
  forwardToSheet('booking', {
    propertyTitle: breakdown.propertyTitle,
    hostName, hostEmail, hostPhone,
    tenantName: body.tenantName,
    tenantEmail: body.tenantEmail,
    tenantPhone: body.tenantPhone,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    nights: breakdown.nights,
    guests: body.guests,
    guestTotal: breakdown.guestTotal,
    hostPayoutAmount: breakdown.hostPayoutAmount,
  }).catch(() => {})

  res.status(200).json({ ok: true, bookingId: inserted.id, breakdown })
}
