import type { ApiRequest, ApiResponse } from '../_lib/http.js'
import { readJsonBody } from '../_lib/http.js'
import { verifyAdminSession } from '../_lib/adminAuth.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'

interface UpdatePayload {
  id?: string
  status?: 'approved' | 'rejected' | 'pending'
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
    res.status(200).json({ configured: false, message: (err as Error).message, submissions: [] })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await admin
      .from('host_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }
    res.status(200).json({ configured: true, submissions: data })
    return
  }

  if (req.method === 'PATCH' || req.method === 'POST') {
    const body = readJsonBody<UpdatePayload>(req)
    if (!body.id || !body.status || !['approved', 'rejected', 'pending'].includes(body.status)) {
      res.status(400).json({ error: 'Missing or invalid id/status' })
      return
    }

    const { error } = await admin
      .from('host_submissions')
      .update({ status: body.status })
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
