import { test, expect } from '@playwright/test'

// Real auth (api/auth.ts) replaced the old name+email instant-login flow —
// signup now requires a password and an emailed OTP before a session
// issues. These tests cover what's verifiable without a live inbox (this
// suite doesn't have one): API-level auth/rate-limit behavior, and that the
// UI reaches (but cannot silently skip past) the OTP step.

test.describe('Auth UI', () => {
  test('signup form requires a password and reaches the OTP step, never logging in without verification', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign In / Sign Up', exact: true }).click()

    await expect(page.getByRole('heading', { name: "Let's create your account" })).toBeVisible()
    await page.getByPlaceholder('Full name (as on your government ID)').fill('Playwright Tester')
    await page.getByPlaceholder('Email address').fill(`playwright-${Date.now()}@example.com`)
    await page.locator('input[type="date"]').fill('1995-01-01')
    await page.getByPlaceholder('Password (min. 8 characters)').fill('a-real-password-123')
    await page.getByRole('button', { name: 'Agree and continue' }).click()

    // Either the OTP step renders (Supabase migrated + email delivery
    // configured) or an inline error surfaces (e.g. users/otp_codes tables
    // not migrated yet, or Sheets email not configured) — either way,
    // "Everyone belongs here"/logged-in nav must never appear without a
    // real code being verified.
    await expect(page.getByRole('heading', { name: "Confirm it's you" }).or(page.locator('.text-rose-600'))).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('Everyone belongs here')).not.toBeVisible()
  })
})

test.describe('Auth API (api/auth.ts)', () => {
  test('session check with no cookie is unauthenticated', async ({ request }) => {
    const res = await request.get('/api/auth?action=session')
    expect(res.status()).toBe(401)
  })

  test('signup rejects a short password', async ({ request }) => {
    const res = await request.post('/api/auth', {
      data: { action: 'signup', name: 'Test User', email: `test-${Date.now()}@example.com`, password: 'short' },
    })
    expect(res.status()).toBe(400)
  })

  test('signup either sends a real OTP or safely reports delivery failure — never issues a session without verification', async ({ request }) => {
    const res = await request.post('/api/auth', {
      data: { action: 'signup', name: 'Test User', email: `test-${Date.now()}@example.com`, password: 'a-real-password-123' },
    })
    // Whether OTP delivery succeeds depends on SHEETS_WEBAPP_URL being
    // configured in this environment — assert whichever outcome happens is
    // internally consistent, not a fixed one (same pattern as
    // api-security.spec.ts's payments/bookings-order tests).
    expect([200, 502]).toContain(res.status())
    const body = await res.json()
    if (res.status() === 200) {
      expect(body.pendingVerification).toBe(true)
    } else {
      expect(body.error).toBeTruthy()
    }
    expect(res.headers()['set-cookie']).toBeFalsy()
  })

  test('verify-otp rejects a wrong/nonexistent code', async ({ request }) => {
    const res = await request.post('/api/auth', {
      data: { action: 'verify-otp', email: `nobody-${Date.now()}@example.com`, code: '000000' },
    })
    expect(res.status()).toBe(400)
  })

  test('login rejects a nonexistent account without leaking whether the email exists', async ({ request }) => {
    const res = await request.post('/api/auth', {
      data: { action: 'login', email: `nobody-${Date.now()}@example.com`, password: 'whatever-123' },
    })
    expect(res.status()).toBe(401)
  })

  test('switch-role requires an authenticated session', async ({ request }) => {
    const res = await request.post('/api/auth', { data: { action: 'switch-role' } })
    expect(res.status()).toBe(401)
  })

  test('update-profile requires an authenticated session', async ({ request }) => {
    const res = await request.post('/api/auth', { data: { action: 'update-profile', name: 'Someone Else' } })
    expect(res.status()).toBe(401)
  })

  test('login rate-limits after repeated attempts from the same client', async ({ request }) => {
    const headers = { 'x-forwarded-for': '203.0.113.99' }
    const results: number[] = []
    for (let i = 0; i < 12; i++) {
      const res = await request.post('/api/auth', {
        data: { action: 'login', email: 'nobody@example.com', password: 'wrong-password' },
        headers,
      })
      results.push(res.status())
    }
    expect(results.some((s) => s === 429)).toBeTruthy()
  })

  test('unknown action is rejected', async ({ request }) => {
    const res = await request.post('/api/auth', { data: { action: 'not-a-real-action' } })
    expect(res.status()).toBe(400)
  })
})
