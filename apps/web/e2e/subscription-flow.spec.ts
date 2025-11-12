import { test, expect } from './fixtures';

test('subscription: premium page loads and plan buttons render', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/premium');
  await expect(page.getByTestId('premium-plans-title')).toBeVisible();
  await expect(page.getByTestId(/plan-card-/).first()).toBeVisible();
  await expect(page.getByTestId('premium-activate-button')).toBeVisible();
});
