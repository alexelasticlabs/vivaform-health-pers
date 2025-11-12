import { test, expect } from './fixtures';

// Navigate from dashboard to premium page and verify elements

test('Navigate to Premium page and see pricing', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/app');

  // Find Upgrade button/cta and click
  const upgrade = page.getByRole('link', { name: /upgrade/i }).first().or(page.getByRole('button', { name: /upgrade/i }).first());
  await upgrade.click();

  await expect(page).toHaveURL(/\/premium/);

  // Check pricing plans presence
  await expect(page.getByTestId('premium-plans-section')).toBeVisible();
  await expect(page.getByTestId(/plan-card-/).first()).toBeVisible();
  await expect(page.getByTestId('premium-activate-button')).toBeVisible();
});
