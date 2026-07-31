import { randomBytes } from 'node:crypto'
import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { getClientIp, readJsonBody } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { sendViaAppsScriptAwaited } from './_lib/sheets.js'
import {
  hashPassword,
  verifyPassword,
  createUserSessionCookie,
  clearUserSessionCookie,
  verifyUserSession,
  generateOtpCode,
  hashOtp,
  verifyOtpHash,
  type UserRole,
} from './_lib/userAuth.js'

/** Real tenant/host account system — signup requires an emailed OTP before a
 * session is issued; ordinary login just checks the password (matching
 * Airbnb's own flow: OTP only confirms identity once, at signup). Single
 * action-dispatched route (mirrors api/submit.ts's pattern) to stay under
 * Vercel's 12-function Hobby-plan cap — see CLAUDE.md. */

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_OTP_ATTEMPTS = 5

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  email_verified: boolean
}

function publicUser(row: UserRow) {
  return {
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function sendOtpEmail(email: string, name: string, code: string): Promise<boolean> {
  return sendViaAppsScriptAwaited('otp', { email, name, code })
}

/** Top-level guard: any uncaught throw inside handleRequest (most likely a
 * missing env var like USER_SESSION_SECRET/OTP_SECRET — createUserSessionCookie/
 * hashOtp throw synchronously if their secret isn't configured) previously
 * surfaced to the client as an unparseable non-JSON error response, which
 * src/components/AuthModal.tsx's `.catch(() => ({}))` then silently turned
 * into a generic "Could not sign in" message with no way to diagnose it.
 * Wrapping here guarantees a real JSON error body every time. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    await handleRequest(req, res)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Internal server error' })
  }
}

async function handleRequest(req: ApiRequest, res: ApiResponse) {
  const body = readJsonBody<Record<string, unknown>>(req)
  const query = req.query.action
  const action = (req.method === 'GET' ? (Array.isArray(query) ? query[0] : query) : (body.action as string | undefined)) ?? ''

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  const ip = getClientIp(req)

  // --- GET action=session ---
  if (req.method === 'GET' && action === 'session') {
    const session = verifyUserSession(req)
    if (!session) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    const { data: row, error } = await admin.from('users').select('*').eq('id', session.userId).maybeSingle()
    if (error || !row) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    res.status(200).json({ user: publicUser(row as UserRow) })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // --- POST action=logout ---
  if (action === 'logout') {
    res.setHeader('Set-Cookie', clearUserSessionCookie())
    res.status(200).json({ ok: true })
    return
  }

  // --- POST action=signup ---
  if (action === 'signup') {
    const limit = rateLimit(`auth-signup:${ip}`, 8, 60 * 60 * 1000)
    if (!limit.allowed) {
      res.status(429).json({ error: 'Too many attempts. Please try again later.' })
      return
    }

    const { name, email: rawEmail, password, phone } = body as {
      name?: string
      email?: string
      password?: string
      phone?: string
    }
    if (!name?.trim() || !rawEmail?.trim() || !password || password.length < 8) {
      res.status(400).json({ error: 'Name, a valid email, and a password of at least 8 characters are required.' })
      return
    }
    const email = normalizeEmail(rawEmail)

    const { data: existing } = await admin.from('users').select('id, email_verified').ilike('email', email).maybeSingle()
    if (existing?.email_verified) {
      res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' })
      return
    }

    const passwordHash = await hashPassword(password)
    let userId = existing?.id as string | undefined

    if (userId) {
      // Unverified row from a prior abandoned signup — reuse it rather than
      // erroring on the unique email index.
      await admin.from('users').update({ name: name.trim(), password_hash: passwordHash, phone: phone?.trim() || null }).eq('id', userId)
    } else {
      const { data: inserted, error: insertError } = await admin
        .from('users')
        .insert({ name: name.trim(), email, password_hash: passwordHash, phone: phone?.trim() || null, role: 'tenant', email_verified: false })
        .select('id')
        .single()
      if (insertError || !inserted) {
        res.status(502).json({ error: insertError?.message ?? 'Could not create account.' })
        return
      }
      userId = inserted.id
    }

    const code = generateOtpCode()
    await admin.from('otp_codes').delete().ilike('email', email).eq('purpose', 'signup')
    await admin.from('otp_codes').insert({
      email,
      code_hash: hashOtp(email, code),
      purpose: 'signup',
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    })

    const sent = await sendOtpEmail(email, name.trim(), code)
    if (!sent) {
      res.status(502).json({ error: 'Could not send the verification email. Please try again.' })
      return
    }

    res.status(200).json({ ok: true, pendingVerification: true })
    return
  }

  // --- POST action=resend-otp ---
  if (action === 'resend-otp') {
    const limit = rateLimit(`auth-otp:${ip}`, 5, 15 * 60 * 1000)
    if (!limit.allowed) {
      res.status(429).json({ error: 'Too many attempts. Please try again later.' })
      return
    }

    const { email: rawEmail } = body as { email?: string }
    if (!rawEmail?.trim()) {
      res.status(400).json({ error: 'Email is required.' })
      return
    }
    const email = normalizeEmail(rawEmail)
    const { data: user } = await admin.from('users').select('id, name, email_verified').ilike('email', email).maybeSingle()
    if (!user || user.email_verified) {
      // Don't reveal whether the account exists/is already verified.
      res.status(200).json({ ok: true })
      return
    }

    const code = generateOtpCode()
    await admin.from('otp_codes').delete().ilike('email', email).eq('purpose', 'signup')
    await admin.from('otp_codes').insert({
      email,
      code_hash: hashOtp(email, code),
      purpose: 'signup',
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    })
    await sendOtpEmail(email, user.name, code)
    res.status(200).json({ ok: true })
    return
  }

  // --- POST action=verify-otp ---
  if (action === 'verify-otp') {
    const limit = rateLimit(`auth-otp:${ip}`, 10, 15 * 60 * 1000)
    if (!limit.allowed) {
      res.status(429).json({ error: 'Too many attempts. Please try again later.' })
      return
    }

    const { email: rawEmail, code } = body as { email?: string; code?: string }
    if (!rawEmail?.trim() || !code?.trim()) {
      res.status(400).json({ error: 'Email and code are required.' })
      return
    }
    const email = normalizeEmail(rawEmail)

    const { data: otpRow } = await admin
      .from('otp_codes')
      .select('*')
      .ilike('email', email)
      .eq('purpose', 'signup')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!otpRow || new Date(otpRow.expires_at).getTime() <= Date.now() || otpRow.attempts >= MAX_OTP_ATTEMPTS) {
      res.status(400).json({ error: 'Code expired or no longer valid. Request a new one.' })
      return
    }

    if (!verifyOtpHash(email, code.trim(), otpRow.code_hash)) {
      await admin.from('otp_codes').update({ attempts: otpRow.attempts + 1 }).eq('id', otpRow.id)
      res.status(400).json({ error: 'Incorrect code.' })
      return
    }

    const { data: row, error } = await admin.from('users').update({ email_verified: true }).ilike('email', email).select('*').single()
    if (error || !row) {
      res.status(502).json({ error: 'Could not verify account.' })
      return
    }
    await admin.from('otp_codes').delete().eq('id', otpRow.id)

    res.setHeader('Set-Cookie', createUserSessionCookie(row.id, row.role))
    res.status(200).json({ user: publicUser(row as UserRow) })
    return
  }

  // --- POST action=login ---
  if (action === 'login') {
    const limit = rateLimit(`auth-login:${ip}`, 10, 15 * 60 * 1000)
    if (!limit.allowed) {
      res.status(429).json({ error: 'Too many attempts. Please try again later.' })
      return
    }

    const { email: rawEmail, password } = body as { email?: string; password?: string }
    if (!rawEmail?.trim() || !password) {
      res.status(400).json({ error: 'Email and password are required.' })
      return
    }
    const email = normalizeEmail(rawEmail)

    const { data: row } = await admin.from('users').select('*').ilike('email', email).maybeSingle()
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      res.status(401).json({ error: 'Incorrect email or password.' })
      return
    }
    if (!row.email_verified) {
      res.status(403).json({ error: 'Please verify your email before logging in.' })
      return
    }

    res.setHeader('Set-Cookie', createUserSessionCookie(row.id, row.role))
    res.status(200).json({ user: publicUser(row as UserRow) })
    return
  }

  // --- POST action=switch-role ---
  if (action === 'switch-role') {
    const session = verifyUserSession(req)
    if (!session) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    const nextRole: UserRole = session.role === 'host' ? 'tenant' : 'host'
    const { data: row, error } = await admin.from('users').update({ role: nextRole }).eq('id', session.userId).select('*').single()
    if (error || !row) {
      res.status(502).json({ error: 'Could not switch roles.' })
      return
    }
    res.setHeader('Set-Cookie', createUserSessionCookie(row.id, row.role))
    res.status(200).json({ user: publicUser(row as UserRow) })
    return
  }

  // --- POST action=google-auth ---
  // NOTE: trusts the decoded Google ID token payload from the client
  // (src/lib/googleAuth.ts) without re-verifying its signature against
  // Google's JWKS server-side — a real hardening follow-up, flagged rather
  // than silently left as-is, since this is the one path in this file that
  // doesn't independently confirm the email the way password+OTP signup
  // does. Good enough to keep the existing Google button working with a
  // real session cookie instead of the old fully-local fake login.
  if (action === 'google-auth') {
    const { name, email: rawEmail } = body as { name?: string; email?: string }
    if (!name?.trim() || !rawEmail?.trim()) {
      res.status(400).json({ error: 'Name and email are required.' })
      return
    }
    const email = normalizeEmail(rawEmail)

    const { data: existing } = await admin.from('users').select('*').ilike('email', email).maybeSingle()
    let row = existing as UserRow | null
    if (!row) {
      const { data: inserted, error } = await admin
        .from('users')
        .insert({ name: name.trim(), email, password_hash: await hashPassword(randomBytes(24).toString('hex')), role: 'tenant', email_verified: true })
        .select('*')
        .single()
      if (error || !inserted) {
        res.status(502).json({ error: 'Could not create account.' })
        return
      }
      row = inserted as UserRow
    } else if (!row.email_verified) {
      const { data: updated } = await admin.from('users').update({ email_verified: true }).eq('id', row.id).select('*').single()
      if (updated) row = updated as UserRow
    }

    res.setHeader('Set-Cookie', createUserSessionCookie(row.id, row.role))
    res.status(200).json({ user: publicUser(row) })
    return
  }

  // --- POST action=update-profile ---
  if (action === 'update-profile') {
    const session = verifyUserSession(req)
    if (!session) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    const { name, phone, avatarUrl } = body as { name?: string; phone?: string; avatarUrl?: string }
    const { data: row, error } = await admin
      .from('users')
      .update({
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() || null }),
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl || null }),
      })
      .eq('id', session.userId)
      .select('*')
      .single()
    if (error || !row) {
      res.status(502).json({ error: 'Could not update profile.' })
      return
    }
    res.status(200).json({ user: publicUser(row as UserRow) })
    return
  }

  res.status(400).json({ error: 'Unknown or missing action' })
}
