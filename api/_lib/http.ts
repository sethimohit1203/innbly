/** Minimal request/response contract shared by every serverless handler.
 * Matches enough of Vercel's Node runtime (and our local dev shim) to avoid
 * depending on @vercel/node types. */
export interface ApiRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  query: Record<string, string | string[] | undefined>
  body: unknown
  cookies: Record<string, string>
}

export interface ApiResponse {
  status(code: number): ApiResponse
  setHeader(name: string, value: string): void
  json(body: unknown): void
  end(body?: string): void
}

export function getClientIp(req: ApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded)) return forwarded[0]
  return 'unknown'
}

export function readJsonBody<T = Record<string, unknown>>(req: ApiRequest): T {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T
    } catch {
      return {} as T
    }
  }
  return (req.body as T) ?? ({} as T)
}
