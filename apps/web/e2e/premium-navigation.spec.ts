import { test, expect } from '@playwright/test';

// Navigate from dashboard to premium page and verify elements

test('Navigate to Premium page and see pricing', async ({ page }) => {
  await page.goto('/app');

  // Find Upgrade button/cta and click
  const upgrade = page.getByRole('link', { name: /upgrade/i }).first().or(page.getByRole('button', { name: /upgrade/i }).first());
  await upgrade.click();

  await expect(page).toHaveURL(/\/premium/);

  // Check pricing plans presence
  await expect(page.getByText(/Monthly/i)).toBeVisible();
  await expect(page.getByText(/Annual/i)).toBeVisible();

  // Try to click checkout (will redirect to Stripe in real mode; we just ensure button exists)
  const select = page.getByRole('button', { name: /continue|subscribe|checkout/i }).first();
  await select.hover();
});

