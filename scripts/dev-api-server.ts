/**
 * Local dev stand-in for Vercel's serverless runtime. Routes requests to
 * the same handler files under api/ that Vercel deploys, using a minimal
 * req/res shim so the handler code is identical in dev and production.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { URL } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ApiRequest, ApiResponse } from '../api/_lib/http'

function loadDotEnv() {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}
loadDotEnv()

const PORT = Number(process.env.API_PORT ?? 8787)

const ROUTES: Record<string, () => Promise<{ default: (req: ApiRequest, res: ApiResponse) => unknown }>> = {
  '/api/leads': () => import('../api/leads'),
  '/api/signup': () => import('../api/signup'),
  '/api/newsletter': () => import('../api/newsletter'),
  '/api/contact': () => import('../api/contact'),
  '/api/price': () => import('../api/price'),
  '/api/admin/login': () => import('../api/admin/login'),
  '/api/admin/logout': () => import('../api/admin/logout'),
  '/api/admin/stats': () => import('../api/admin/stats'),
  '/api/payments/create-order': () => import('../api/payments/create-order'),
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!header) return cookies
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key) cookies[key] = decodeURIComponent(rest.join('='))
  }
  return cookies
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function buildResponse(res: ServerResponse): ApiResponse {
  let statusCode = 200
  const api: ApiResponse = {
    status(code: number) {
      statusCode = code
      return api
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value)
    },
    json(body: unknown) {
      res.statusCode = statusCode
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    },
    end(body?: string) {
      res.statusCode = statusCode
      res.end(body)
    },
  }
  return api
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const loadHandler = ROUTES[url.pathname]

  if (!loadHandler) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  const rawBody = await readBody(req)
  let parsedBody: unknown = rawBody
  const contentType = req.headers['content-type'] ?? ''
  if (contentType.includes('application/json') || contentType.includes('text/plain')) {
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      parsedBody = {}
    }
  }

  const apiReq: ApiRequest = {
    method: req.method,
    headers: req.headers as Record<string, string | string[] | undefined>,
    query: Object.fromEntries(url.searchParams.entries()),
    body: parsedBody,
    cookies: parseCookies(req.headers.cookie),
  }

  try {
    const mod = await loadHandler()
    await mod.default(apiReq, buildResponse(res))
  } catch (err) {
    console.error(`[dev-api] ${url.pathname} failed:`, err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

server.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`)
})
