import { test, expect } from './fixtures';

// Smoke test: premium checkout flow with network mocks

test('Premium checkout smoke', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.route('**/api/subscriptions', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan: null, status: 'NONE' }) });
    } else {
      await route.continue();
    }
  });
  await page.route('**/api/subscriptions/premium-view', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/api/subscriptions/checkout', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://checkout.stripe.dev/session/mock' }) });
    } else {
      await route.continue();
    }
  });
  await page.goto('/premium');
  const cta = page.getByTestId('premium-activate-button');
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(cta).toBeVisible();
});

// Explicitly verify "Best value" badge is present on recommended plan

test('Premium plans show best value badge', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/premium');
  await expect(page.getByTestId('premium-plans-section')).toBeVisible();
  await expect(page.getByTestId('plan-badge-best')).toBeVisible();
});
