import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { getClientIp, readJsonBody } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { forwardToSheet } from './_lib/sheets.js'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'

/** Combines what used to be five separate route files (leads, signup,
 * newsletter, contact, host-listing) into one — Vercel's Hobby plan caps a
 * deployment at 12 serverless functions, and adding the booking flow's new
 * routes pushed the count past that. These five all did the same shape of
 * thing (rate limit → validate → best-effort forward to Google Sheets), so
 * consolidating behind a `type` field costs nothing functionally and buys
 * headroom for future routes. 'review' was added later and takes a
 * different path (see handleReview below) since it needs a Supabase write,
 * not just a Sheets forward. */

type SubmissionType = 'lead' | 'signup' | 'newsletter' | 'contact' | 'hostListing' | 'review' | 'coHostInvite' | 'blogPost'

const RATE_LIMITS: Record<SubmissionType, { max: number; windowMs: number; message: string }> = {
  lead: { max: 5, windowMs: 10 * 60 * 1000, message: 'Too many visit requests. Please try again later.' },
  signup: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many signup attempts. Please try again later.' },
  newsletter: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many attempts. Please try again later.' },
  contact: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many messages sent. Please try again later.' },
  hostListing: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many submissions. Please try again later.' },
  review: { max: 10, windowMs: 60 * 60 * 1000, message: 'Too many reviews submitted. Please try again later.' },
  coHostInvite: { max: 5, windowMs: 60 * 60 * 1000, message: 'Too many invites sent. Please try again later.' },
  // Generous — this is hit by a scheduled n8n workflow every few hours, not
  // by end-user traffic, but still rate-limited so a leaked secret can't be
  // used to hammer the DB.
  blogPost: { max: 20, windowMs: 60 * 60 * 1000, message: 'Too many blog posts submitted. Please try again later.' },
}

function isValid(type: SubmissionType, body: Record<string, unknown>): boolean {
  switch (type) {
    case 'lead':
      return Boolean(body.name && body.phone && body.propertyTitle && body.visitDate)
    case 'signup':
      return Boolean(body.name && body.email && body.role)
    case 'newsletter':
      return Boolean(body.email)
    case 'contact':
      return Boolean(body.name && body.email && body.message)
    case 'hostListing':
      return Boolean(body.ownerName && body.ownerEmail && body.propertyTitle)
    case 'review':
      return Boolean(
        body.bookingId &&
          body.tenantEmail &&
          typeof body.rating === 'number' &&
          body.rating >= 1 &&
          body.rating <= 5,
      )
    case 'coHostInvite':
      return Boolean(body.hostEmail && body.coHostEmail)
    case 'blogPost':
      return Boolean(body.title && body.slug && body.content)
  }
}

interface ReviewBody {
  bookingId: string
  tenantEmail: string
  rating: number
  comment?: string
}

/** Reviews can't go through the generic forwardToSheet path — they need a
 * Supabase write, and that write must be trustworthy (never let the browser
 * insert a review for a booking it doesn't own, or for a stay that hasn't
 * happened yet), so it's verified server-side against the bookings table
 * with the service-role key, same trust boundary as api/bookings/verify.ts. */
async function handleReview(body: ReviewBody, res: ApiResponse) {
  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id, property_id, tenant_name, tenant_email, check_out, status')
    .eq('id', body.bookingId)
    .maybeSingle()

  if (bookingError || !booking) {
    res.status(404).json({ error: 'Booking not found.' })
    return
  }
  if (booking.tenant_email?.toLowerCase() !== body.tenantEmail.trim().toLowerCase()) {
    res.status(403).json({ error: 'This booking does not belong to that email.' })
    return
  }
  if (booking.status === 'cancelled') {
    res.status(400).json({ error: 'Cancelled bookings cannot be reviewed.' })
    return
  }
  if (new Date(booking.check_out) > new Date()) {
    res.status(400).json({ error: 'You can review a stay only after check-out.' })
    return
  }

  const { error: insertError } = await admin.from('reviews').insert({
    booking_id: booking.id,
    property_id: booking.property_id,
    tenant_name: booking.tenant_name,
    rating: Math.round(body.rating),
    comment: (body.comment ?? '').trim(),
  })

  if (insertError) {
    // Unique constraint on booking_id — this stay was already reviewed.
    if (insertError.code === '23505') {
      res.status(409).json({ error: 'You already reviewed this stay.' })
      return
    }
    res.status(502).json({ error: insertError.message })
    return
  }

  res.status(200).json({ ok: true })
}

interface BlogPostBody {
  title: string
  slug: string
  content: string
  description?: string
  coverImage?: string
  tags?: string[]
  author?: string
  source?: string
  secret?: string
}

/** Ingestion endpoint for the auto-blogging n8n workflows (adapted from the
 * CircleOfLearning and ProRido pipelines this repo's owner already runs —
 * see n8n-workflows/innbly-auto-blogging.json). Unlike every other type
 * here, the caller isn't the site's own browser, so it can't be trusted by
 * origin alone — gated behind a shared secret (BLOG_INGEST_SECRET) instead
 * of a session cookie. Upserts on slug so a re-run (e.g. n8n retrying after
 * a timeout) edits the same post rather than creating a duplicate. */
async function handleBlogPost(body: BlogPostBody, res: ApiResponse) {
  const expected = process.env.BLOG_INGEST_SECRET
  if (!expected) {
    res.status(500).json({ error: 'Blog ingestion is not configured (BLOG_INGEST_SECRET missing).' })
    return
  }
  if (body.secret !== expected) {
    res.status(403).json({ error: 'Invalid secret.' })
    return
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  const { error } = await admin.from('blog_posts').upsert(
    {
      slug: body.slug.trim(),
      title: body.title.trim(),
      description: (body.description ?? '').trim(),
      content: body.content,
      cover_image: body.coverImage ?? '',
      tags: body.tags ?? [],
      author: body.author?.trim() || 'Innbly Editorial Team',
      source: body.source ?? 'manual',
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slug' },
  )

  if (error) {
    res.status(502).json({ error: error.message })
    return
  }

  res.status(200).json({ ok: true, url: `https://www.innbly.com/blog/${body.slug.trim()}` })
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = readJsonBody<Record<string, unknown> & { type?: SubmissionType }>(req)
  const type = body.type
  if (!type || !RATE_LIMITS[type]) {
    console.log('[api/submit] Invalid body or type:', {
      receivedType: typeof req.body,
      keys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
      body: req.body
    })
    res.status(400).json({ 
      error: 'Unknown or missing submission type',
      debug: {
        receivedType: typeof req.body,
        isBuffer: req.body ? req.body.constructor.name === 'Buffer' : false,
        keys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
        bodyPreview: typeof req.body === 'string' ? req.body.slice(0, 200) : JSON.stringify(req.body).slice(0, 200)
      }
    })
    return
  }

  const ip = getClientIp(req)
  const { max, windowMs, message } = RATE_LIMITS[type]
  const limit = rateLimit(`${type}:${ip}`, max, windowMs)
  if (!limit.allowed) {
    res.status(429).json({ error: message, retryAfterSeconds: limit.retryAfterSeconds })
    return
  }

  if (!isValid(type, body)) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  if (type === 'review') {
    await handleReview(body as unknown as ReviewBody, res)
    return
  }

  if (type === 'blogPost') {
    await handleBlogPost(body as unknown as BlogPostBody, res)
    return
  }

  const { type: _type, ...payload } = body
  await forwardToSheet(type, payload)
  res.status(200).json({ ok: true })
}
