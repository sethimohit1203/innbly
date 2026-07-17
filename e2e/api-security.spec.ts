import { test, expect } from '@playwright/test'

test.describe('API security', () => {
  test('the built client bundle never contains the Sheets webapp URL or admin secrets', async ({ page }) => {
    const responses: string[] = []
    page.on('response', async (res) => {
      if (res.url().endsWith('.js')) {
        try {
          responses.push(await res.text())
        } catch {
          // ignore
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const bundle = responses.join('\n')
    expect(bundle).not.toContain('script.google.com')
    expect(bundle).not.toContain('ADMIN_PASSCODE')
    expect(bundle).not.toContain('ADMIN_SESSION_SECRET')
    expect(bundle).not.toContain('RAZORPAY_KEY_SECRET')
  })

  test('price calculation is authoritative from the server, not the client', async ({ request }) => {
    const res = await request.post('/api/price', {
      data: { kind: 'booking', propertyId: 'p1', nights: 3, meals: true, ac: true },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    // p1 price is 12500/month -> ~417/night; verify server computed it, not trusting a client-sent total
    expect(body.nightlyRate).toBe(Math.round(12500 / 30))
    expect(body.total).toBe(body.roomTotal + body.mealsCost + body.acCost)
  })

  test('price endpoint ignores a client-supplied total and recomputes it', async ({ request }) => {
    const res = await request.post('/api/price', {
      // @ts-expect-error intentionally sending a bogus field an attacker might try
      data: { kind: 'booking', propertyId: 'p1', nights: 1, meals: false, ac: false, total: 1 },
    })
    const body = await res.json()
    expect(body.total).not.toBe(1)
  })

  test('leads endpoint rate-limits after repeated requests from the same client', async ({ request }) => {
    // Use a synthetic IP so this doesn't share a rate-limit bucket with other
    // tests/browser traffic in the suite (which all resolve to the same
    // "unknown" bucket locally, since dev traffic has no x-forwarded-for header).
    const headers = { 'x-forwarded-for': '203.0.113.42' }
    const payload = { name: 'Rate Test', phone: '9999999999', propertyTitle: 'Test Property', visitDate: '2026-01-01' }
    const results: number[] = []
    for (let i = 0; i < 8; i++) {
      const res = await request.post('/api/leads', { data: payload, headers })
      results.push(res.status())
    }
    expect(results.some((s) => s === 429)).toBeTruthy()
  })

  test('unauthenticated request to admin stats is rejected', async ({ request }) => {
    const res = await request.get('/api/admin/stats')
    expect(res.status()).toBe(401)
  })

  test('payments endpoint safely reports not-configured without real Razorpay keys', async ({ request }) => {
    const res = await request.post('/api/payments/create-order', { data: { amountInPaise: 100000 } })
    expect(res.status()).toBe(501)
  })
})
