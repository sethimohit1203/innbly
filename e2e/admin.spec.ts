import { test, expect } from '@playwright/test'

test.describe('Admin dashboard', () => {
  test('rejects wrong passcode and accepts the right one', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()

    await page.getByPlaceholder('Passcode').fill('wrong-passcode')
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.getByText(/incorrect passcode/i)).toBeVisible()

    await page.getByPlaceholder('Passcode').fill('test1234')
    await page.getByRole('button', { name: 'Enter' }).click()

    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
    await expect(page.getByText('Visit Requests')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible()
  })

  test('logging out requires the passcode again', async ({ page }) => {
    await page.goto('/admin')
    await page.getByPlaceholder('Passcode').fill('test1234')
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()

    await page.getByRole('button', { name: /log out/i }).click()
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
  })
})
