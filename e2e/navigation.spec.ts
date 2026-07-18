import { test, expect } from '@playwright/test'

test.describe('Core navigation & pages', () => {
  test('home page loads with hero and property grid', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Find Your Perfect Space/i })).toBeVisible()
    await expect(page.getByText(/Sunrise Coliving/i)).toBeVisible()
  })

  test('home search widget navigates to /search with query params', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Any Area / City').fill('Bengaluru')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/\/search\?city=Bengaluru/)
  })

  test('search page filters by property type', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByText(/stays found/i)).toBeVisible()
    await page.getByRole('button', { name: 'Villas', exact: true }).click()
    await expect(page.getByText('1 stays found')).toBeVisible()
    await expect(page.getByText(/Palm Grove Villa/i)).toBeVisible()
  })

  test('direct navigation to a deep route does not 404', async ({ page }) => {
    const response = await page.goto('/enterprise/dashboard')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { name: /Operations Dashboard/i })).toBeVisible()
  })

  test('property detail page sets a dynamic title', async ({ page }) => {
    await page.goto('/property/p1')
    await expect(page).toHaveTitle(/Sunrise Coliving.*for Rent in Koramangala/i)
    await expect(page.getByRole('heading', { name: /Sunrise Coliving/i })).toBeVisible()
  })

  test('footer legal pages are reachable', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Privacy Policy', exact: true }).first().click()
    await expect(page).toHaveURL(/\/privacy-policy/)
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()
  })

  test('unauthenticated user is redirected away from /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })
})
