import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('tenant signup logs in and unlocks tenant nav', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()

    await page.getByPlaceholder('Full name').fill('Playwright Tester')
    await page.getByPlaceholder('Email address').fill('playwright-tester@example.com')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Playwright')).toBeVisible()
  })
})
