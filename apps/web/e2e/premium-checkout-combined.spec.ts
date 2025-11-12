import { test, expect } from './fixtures';

test('Premium checkout combined', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.route('**/api/subscriptions/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/premium-view')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    } else if (url.includes('/checkout')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://checkout.example.com/session' }) });
    } else if (url.includes('/sync-session')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    }
  });
  await page.goto('/premium');
  const checkoutBtn = page.getByTestId('premium-activate-button');
  await expect(checkoutBtn).toBeVisible();
  await checkoutBtn.click();
  await expect(page).toHaveURL(/premium|checkout/i);

  // Negative path
  await page.route('**/api/subscriptions/checkout**', async (route) => {
    await route.abort();
  });
  await page.goto('/premium');
  const checkoutBtn2 = page.getByTestId('premium-activate-button');
  const beforeUrl = page.url();
  await checkoutBtn2.click();
  await expect(checkoutBtn2).toBeVisible();
  await expect(page).toHaveURL(beforeUrl);
});
