import { test, expect } from './fixtures';

test('Premium checkout negative', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.route('**/api/subscriptions/checkout', async (route) => {
    await route.abort();
  });
  await page.goto('/premium');
  const checkoutBtn = page.getByTestId('premium-activate-button');
  await expect(checkoutBtn).toBeVisible();
  const before = page.url();
  await checkoutBtn.click();
  await expect(page).toHaveURL(before);
});
