import { test, expect } from '@playwright/test';

// Smoke test: premium checkout flow with network mocks

test('Premium checkout smoke', async ({ page }) => {
  await page.route('**/api/subscriptions', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        plan: null,
        status: 'NONE'
      }) });
    } else {
      await route.continue();
    }
  });
  await page.route('**/api/subscriptions/premium-view', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/api/subscriptions/checkout', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        url: 'https://checkout.stripe.dev/session/mock'
      }) });
    } else {
      await route.continue();
    }
  });
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', tier: 'FREE' }) });
  });

  await page.goto('/premium');
  const cta = page.getByRole('button', { name: /activate vivaform\+/i });
  await expect(cta).toBeVisible();
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    cta.click()
  ]);
  await expect(popup).toBeTruthy();
  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toContain('checkout.stripe.dev');
});
