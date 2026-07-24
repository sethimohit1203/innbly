export interface BookingBreakdown {
  propertyId: string
  propertyTitle: string
  nights: number
  nightlyRate: number
  roomSubtotal: number
  guestServiceFee: number
  gstRate: number
  gstAmount: number
  securityDeposit: number
  guestTotal: number
  hostCommission: number
  hostPayoutAmount: number
}

interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  keyId: string
  breakdown: BookingBreakdown
}

export async function createBookingOrder(input: {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
}): Promise<CreateOrderResponse> {
  const res = await fetch('/api/bookings/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Could not start checkout. Please try again.')
  return data
}

export async function verifyBookingPayment(input: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  tenantName: string
  tenantEmail: string
  tenantPhone: string
}): Promise<{ ok: boolean; bookingId: string }> {
  const res = await fetch('/api/bookings/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Payment succeeded but the booking could not be confirmed. Contact support.')
  return data
}
