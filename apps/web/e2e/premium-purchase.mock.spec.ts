import { test, expect } from './fixtures';

// Mocked purchase flow stays in E2E without hitting real Stripe

test('premium purchase mocked path', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.route('**/api/subscriptions/checkout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://example.com/checkout/mock' }) });
  });
  await page.goto('/premium');
  const buyBtn = page.getByTestId('premium-activate-button');
  await expect(buyBtn).toBeVisible();
  await buyBtn.click();
  await expect(buyBtn).toBeVisible();
});
