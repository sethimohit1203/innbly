import { test, expect } from '@playwright/test'

test.describe('Nightly pricing & guest-based booking', () => {
  test('property cards show nightly pricing and guest capacity, not room type', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('₹1,800').first()).toBeVisible()
    await expect(page.getByText('/ night').first()).toBeVisible()
    await expect(page.getByText('Single', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Sharing', { exact: true })).toHaveCount(0)
  })

  test('search page has a Guests filter and a nightly budget slider, no Room Type', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('select').filter({ hasText: 'Any Guests' })).toBeVisible()
    await expect(page.getByLabel(/≤ ₹/)).toBeVisible()
    await expect(page.locator('select').filter({ hasText: 'Any Room Type' })).toHaveCount(0)
  })

  test('search filter bar stays visible while scrolling the results', async ({ page }) => {
    await page.goto('/search')
    const filterBar = page.locator('select').filter({ hasText: 'Any Guests' })
    await expect(filterBar).toBeVisible()
    await page.mouse.wheel(0, 800)
    await expect(filterBar).toBeVisible()
  })

  test('property detail shows nightly price, guest badge, host profile, and a working date calendar', async ({ page }) => {
    await page.goto('/property/p1')

    await expect(page.getByText('Up to 3 guests')).toBeVisible()
    await expect(page.getByText('/night')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Meet your host' })).toBeVisible()
    await expect(page.getByText('Rahul Mehta')).toBeVisible()
    await expect(page.getByText(/Usually responds within/i)).toBeVisible()

    await page.getByRole('button', { name: /Check-in.*Check-out/ }).click()
    await expect(page.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeVisible()
  })

  test('property detail always shows a "More Places Nearby" recommendations grid', async ({ page }) => {
    await page.goto('/property/p1')
    const heading = page.getByRole('heading', { name: 'More Places Nearby' })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
    const grid = heading.locator('xpath=following-sibling::div[1]')
    const cardCount = await grid.getByRole('link').count()
    expect(cardCount).toBeGreaterThanOrEqual(3)
    expect(cardCount).toBeLessThanOrEqual(4)
  })
})
