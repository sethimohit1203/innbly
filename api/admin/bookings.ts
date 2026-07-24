import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { readJsonBody } from '../_lib/http.js'
import { verifyAdminSession } from '../_lib/adminAuth.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'

interface UpdatePayload {
  id?: string
  payoutStatus?: 'unpaid' | 'paid'
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!verifyAdminSession(req)) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(200).json({ configured: false, message: (err as Error).message, bookings: [] })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await admin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }
    res.status(200).json({ configured: true, bookings: data })
    return
  }

  if (req.method === 'PATCH') {
    const body = readJsonBody<UpdatePayload>(req)
    if (!body.id || !body.payoutStatus || !['unpaid', 'paid'].includes(body.payoutStatus)) {
      res.status(400).json({ error: 'Missing or invalid id/payoutStatus' })
      return
    }

    const { error } = await admin
      .from('bookings')
      .update({ payout_status: body.payoutStatus })
      .eq('id', body.id)

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
