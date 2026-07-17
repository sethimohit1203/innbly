import { test, expect } from '@playwright/test'

test.describe('Auth and visit scheduling', () => {
  test('tenant signup logs in and unlocks tenant nav', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()

    await page.getByRole('button', { name: /Rent a Space/i }).click()
    await page.getByPlaceholder('Full name').fill('Playwright Tester')
    await page.getByPlaceholder('Email address').fill('playwright-tester@example.com')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Playwright')).toBeVisible()
  })

  test('schedule visit modal blocks an invalid phone number and enables on valid input', async ({ page }) => {
    await page.goto('/property/p1')
    await page.getByRole('button', { name: /Schedule a Free Visit/i }).click()

    await expect(page.getByRole('heading', { name: /Schedule Premium Visit/i })).toBeVisible()
    await page.getByLabel(/Your Name/i).fill('Playwright Tester')
    await page.getByLabel(/Phone number/i).fill('123')
    await page.getByLabel(/Phone number/i).blur()

    await expect(page.getByText(/valid phone number/i)).toBeVisible()
    const confirmButton = page.getByRole('button', { name: /Confirm Appointment Booking/i })
    await expect(confirmButton).toBeDisabled()

    await page.getByLabel(/Phone number/i).fill('9876543210')
    await expect(confirmButton).toBeEnabled()
  })

  test('completed visit request appears on the My Scheduled Visits page', async ({ page }) => {
    await page.goto('/property/p2')
    await page.getByRole('button', { name: /Schedule a Free Visit/i }).click()
    await page.getByLabel(/Your Name/i).fill('E2E Visitor')
    await page.getByLabel(/Phone number/i).fill('9123456780')
    await page.getByRole('button', { name: /Confirm Appointment Booking/i }).click()

    await expect(page.getByText(/Visit Successfully Scheduled/i)).toBeVisible()
    await page.getByRole('button', { name: /Back to Home Page/i }).click()

    await page.goto('/my-visits')
    await expect(page.getByText('Green Nest PG')).toBeVisible()
    await expect(page.getByText('9123456780')).toBeVisible()
  })
})
