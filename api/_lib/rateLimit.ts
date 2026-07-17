/**
 * Best-effort in-memory rate limiter. Persists for the lifetime of a warm
 * serverless instance — good enough to blunt basic spam/abuse, but not a
 * strict guarantee across many concurrent instances. For hard guarantees at
 * scale, swap this for Upstash Redis (`@upstash/ratelimit`), which has a
 * free tier and is the standard pairing for Vercel functions.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 }
}
