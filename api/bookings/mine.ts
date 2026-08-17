import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { readJsonBody } from '../_lib/http.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { forwardToSheet } from '../_lib/sheets.js'

type Role = 'host' | 'tenant'

function getEmail(req: ApiRequest): string | undefined {
  const raw = req.query.email
  return (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase()
}

function getRole(req: ApiRequest): Role {
  const raw = req.query.role
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === 'tenant' ? 'tenant' : 'host'
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(200).json({ configured: false, message: (err as Error).message, bookings: [] })
    return
  }

  if (req.method === 'GET') {
    const email = getEmail(req)
    if (!email) {
      res.status(400).json({ error: 'Missing email' })
      return
    }
    const role = getRole(req)
    const column = role === 'tenant' ? 'tenant_email' : 'host_email'

    const { data, error } = await admin
      .from('bookings')
      .select('*')
      .ilike(column, email)
      .order('created_at', { ascending: false })

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }
    res.status(200).json({ configured: true, bookings: data })
    return
  }

  if (req.method === 'PATCH') {
    // Host or tenant cancelling their own upcoming booking. Ownership is
    // checked by matching the email against the row's own host/tenant
    // column — the same "email is the identity" trust model already used
    // by HostOnlyRoute / myBookings.ts (see CLAUDE.md: no real sessions for
    // tenant/host accounts). Admin cancellation is a separate, real-auth
    // path in api/admin/bookings.ts.
    const email = getEmail(req)
    const role = getRole(req)
    const body = readJsonBody<{ id?: string; status?: 'upcoming' | 'cancelled' }>(req)
    if (!email || !body.id || !body.status || !['upcoming', 'cancelled'].includes(body.status)) {
      res.status(400).json({ error: 'Missing or invalid id/status' })
      return
    }
    const column = role === 'tenant' ? 'tenant_email' : 'host_email'

    const { data: booking, error: fetchError } = await admin
      .from('bookings')
      .select('*')
      .eq('id', body.id)
      .ilike(column, email)
      .maybeSingle()

    if (fetchError || !booking) {
      res.status(404).json({ error: 'Booking not found.' })
      return
    }

    if (booking.status === 'cancelled' && body.status === 'cancelled') {
      res.status(400).json({ error: 'Booking is already cancelled.' })
      return
    }

    const { error } = await admin
      .from('bookings')
      .update({ status: body.status })
      .eq('id', body.id)
      .ilike(column, email)

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }

    if (body.status === 'cancelled') {
      forwardToSheet('bookingCancel', {
        propertyTitle: booking.property_title,
        hostEmail: booking.host_email,
        hostName: booking.host_name,
        hostPhone: booking.host_phone,
        tenantEmail: booking.tenant_email,
        tenantName: booking.tenant_name,
        tenantPhone: booking.tenant_phone,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        cancelledBy: role === 'tenant' ? 'Tenant' : 'Host',
      })
    }

    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
