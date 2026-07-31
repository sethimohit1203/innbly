import { createHmac, timingSafeEqual, randomBytes, randomInt, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import type { ApiRequest } from './http.js'

/** Real tenant/host authentication — password hashing, signed session
 * cookies, and OTP verification. Deliberately separate from adminAuth.ts:
 * different secret (USER_SESSION_SECRET, not ADMIN_SESSION_SECRET), and a
 * richer signed payload (this one embeds an identity, not just an expiry),
 * so a compromise of one trust boundary doesn't compromise the other. */

const scrypt = promisify(scryptCallback)

const COOKIE_NAME = 'innbly_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SCRYPT_KEY_LENGTH = 64

function getSessionSecret(): string {
  const secret = process.env.USER_SESSION_SECRET
  if (!secret) throw new Error('USER_SESSION_SECRET is not configured')
  return secret
}

function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET
  if (!secret) throw new Error('OTP_SECRET is not configured')
  return secret
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex')
}

// --- Password hashing (scrypt, no new dependency — node:crypto is built in) ---

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':')
  if (!salt || !hashHex) return false
  const derived = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer
  const expected = Buffer.from(hashHex, 'hex')
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

// --- Session cookie (signed, httpOnly; embeds userId + role) ---

export type UserRole = 'tenant' | 'host'

interface SessionPayload {
  userId: string
  role: UserRole
  expiresAt: number
}

function encodePayload(p: SessionPayload): string {
  return Buffer.from(JSON.stringify(p)).toString('base64url')
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

function cookieFlags(): string {
  // Secure requires HTTPS — always true on Vercel (VERCEL_ENV is set there),
  // but would break cookie delivery over plain http://localhost in dev.
  return process.env.VERCEL_ENV ? '; Secure' : ''
}

export function createUserSessionCookie(userId: string, role: UserRole): string {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const encoded = encodePayload({ userId, role, expiresAt })
  const token = `${encoded}.${sign(encoded, getSessionSecret())}`
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax${cookieFlags()}`
}

export function clearUserSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${cookieFlags()}`
}

export function verifyUserSession(req: ApiRequest): { userId: string; role: UserRole } | null {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null

  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  const expected = sign(encoded, getSessionSecret())
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const payload = decodePayload(encoded)
  if (!payload || !Number.isFinite(payload.expiresAt) || payload.expiresAt <= Date.now()) return null

  return { userId: payload.userId, role: payload.role }
}

// --- OTP (6-digit code, HMAC-hashed at rest — never store the raw code) ---

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export function hashOtp(email: string, code: string): string {
  return sign(`${email.trim().toLowerCase()}:${code}`, getOtpSecret())
}

export function verifyOtpHash(email: string, code: string, storedHash: string): boolean {
  const expected = hashOtp(email, code)
  const a = Buffer.from(storedHash)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
