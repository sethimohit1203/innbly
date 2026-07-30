import { test, expect } from '@playwright/test'

test.describe('Host listing pricing API', () => {
  test('missing listing id is rejected', async ({ request }) => {
    const res = await request.get('/api/host/listing-pricing?code=whatever')
    expect(res.status()).toBe(400)
  })

  test('missing code is rejected without leaking whether the listing exists', async ({ request }) => {
    const res = await request.get('/api/host/listing-pricing?id=00000000-0000-0000-0000-000000000000')
    expect(res.status()).toBe(401)
  })

  test('wrong access code is rejected the same way for an unknown listing id', async ({ request }) => {
    const headers = { 'x-forwarded-for': '203.0.113.77' }
    const res = await request.get('/api/host/listing-pricing?id=00000000-0000-0000-0000-000000000001&code=WRONGCODE', { headers })
    expect(res.status()).toBe(401)
  })

  test('repeated wrong-code attempts trip the rate limit', async ({ request }) => {
    // Synthetic IP so this doesn't share a bucket with other tests/traffic.
    const headers = { 'x-forwarded-for': '203.0.113.88' }
    const results: number[] = []
    for (let i = 0; i < 12; i++) {
      const res = await request.get('/api/host/listing-pricing?id=00000000-0000-0000-0000-000000000002&code=WRONGCODE', { headers })
      results.push(res.status())
    }
    expect(results.some((s) => s === 429)).toBeTruthy()
  })

  test('admin pricing action on host-listings requires an authenticated admin session', async ({ request }) => {
    const res = await request.patch('/api/admin/host-listings', {
      data: { id: '00000000-0000-0000-0000-000000000000', action: 'pricing', pricing: { pricePerNight: 5000 } },
    })
    expect(res.status()).toBe(401)
  })
})
