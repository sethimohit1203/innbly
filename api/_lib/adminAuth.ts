import { createHmac, timingSafeEqual } from 'node:crypto'
import type { ApiRequest } from './http'

const COOKIE_NAME = 'innbly_admin'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured')
  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function createAdminSessionCookie(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = `${expiresAt}`
  const signature = sign(payload)
  const token = `${payload}.${signature}`
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax`
}

export function clearAdminSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
}

export function verifyAdminSession(req: ApiRequest): boolean {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  const expiresAt = Number(payload)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export function checkPasscode(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSCODE?.trim()
  if (!expected) return false
  // Trim the candidate too — a stray trailing space/newline (very easy to
  // introduce when copy-pasting a passcode into a Vercel env var field or
  // an input box) would otherwise make two "identical-looking" values
  // fail the length check below and always report "incorrect passcode".
  const a = Buffer.from(candidate.trim())
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
