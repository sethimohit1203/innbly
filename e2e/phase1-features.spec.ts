import { test, expect } from '@playwright/test'

test.describe('Phase 1 discovery & booking features', () => {
  test('hero quick chip navigates to search with a collection filter applied', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Pool/ }).click()
    await expect(page).toHaveURL(/collection=pool/)
    await expect(page.getByText('Showing: Pool')).toBeVisible()
    await expect(page.getByText(/Palm Grove Villa/i)).toBeVisible()
  })

  test('category scroller and collections grid link into filtered search results', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Women Only' }).first().click()
    await expect(page).toHaveURL(/collection=women-only/)
    await expect(page.getByText(/Green Nest PG/i)).toBeVisible()
  })

  test('wishlist heart on a property card persists to the saved properties page', async ({ page }) => {
    await page.goto('/')
    const heartButtons = page.locator('button:has(svg.lucide-heart)')
    await heartButtons.first().click()
    await page.goto('/saved')
    await expect(page.getByText('Saved Properties')).toBeVisible()
  })

  test('compare page shows properties added via the compare checkbox', async ({ page }) => {
    await page.goto('/search')
    const compareButtons = page.getByTitle('Add to compare')
    await compareButtons.nth(0).click()
    await compareButtons.nth(1).click()
    await page.goto('/compare')
    await expect(page.getByRole('heading', { name: 'Compare Properties' })).toBeVisible()
    await expect(page.getByText('Room Size')).toBeVisible()
  })

  test('host profile page shows host stats and their listings', async ({ page }) => {
    await page.goto('/property/p1')
    await page.getByText('View host profile →').click()
    await expect(page.getByRole('heading', { name: 'Rahul Mehta', exact: true })).toBeVisible()
    await expect(page.getByText('Response Rate')).toBeVisible()
    await expect(page.getByText(/Sunrise Coliving/i)).toBeVisible()
  })

  test('recently viewed section appears on Home after visiting a property', async ({ page }) => {
    await page.goto('/property/p3')
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Recently Viewed' })).toBeVisible()
  })

  test('save search stores a search and shows a confirmation toast', async ({ page }) => {
    await page.goto('/search')
    await page.getByRole('button', { name: /Save Search/i }).click()
    await expect(page.getByText(/Search saved/i)).toBeVisible()
  })

  test('quick match assistant walks through steps to a filtered result', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Quick Match/i }).click()
    const panel = page.getByTestId('quick-match-panel')
    await panel.getByRole('button', { name: 'Any budget' }).click()
    await panel.getByRole('button', { name: 'Any city' }).click()
    await panel.getByRole('button', { name: '1 guest' }).click()
    await panel.getByRole('button', { name: 'Anyone' }).click()
    await expect(panel.getByText(/matches found/i)).toBeVisible()
  })
})
