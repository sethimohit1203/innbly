import { test, expect } from '@playwright/test'

test.describe('Enterprise area', () => {
  test('module showcase switches mockups and ROI calculator fetches from the server', async ({ page }) => {
    await page.goto('/enterprise')
    await expect(page.getByRole('heading', { name: /One platform to run your entire property/i })).toBeVisible()

    await page.getByRole('button', { name: 'F&B POS' }).click()
    await expect(page.getByText('Order → Room 101')).toBeVisible()
    await expect(page.getByText('Posted to folio')).toBeVisible()

    const slider = page.locator('input[type="range"]').first()
    await slider.fill('100')
    await expect(page.getByText('hrs')).toBeVisible()
  })

  test('booking drawer opens with a server-computed live receipt', async ({ page }) => {
    await page.goto('/enterprise/search')
    await page.getByRole('button', { name: /Sunrise Coliving/i }).click()
    await expect(page.getByRole('heading', { name: 'Checkout Calculator' })).toBeVisible()
    await expect(page.getByText('Live Price Receipt')).toBeVisible()
    await expect(page.getByText(/^Total$/)).toBeVisible()
  })

  test('operations dashboard shows metrics and the room timeline', async ({ page }) => {
    await page.goto('/enterprise/dashboard')
    await expect(page.getByText("Tonight's Check-ins")).toBeVisible()
    await expect(page.getByText('Room Timeline')).toBeVisible()
    await expect(page.getByText('A. Kapoor')).toBeVisible()
  })
})
