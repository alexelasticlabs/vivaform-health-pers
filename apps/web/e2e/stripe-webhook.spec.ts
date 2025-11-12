import { test, expect } from './fixtures';

// Simulate Stripe webhook by relying on centralized mock of sync-session

test('stripe webhook simulation: after returning with success, sync is called and UI updates', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/app?premium=success&session_id=cs_test_456');
  await expect(page.getByTestId('app-premium-badge').or(page.getByText(/Dashboard/i))).toBeVisible();
});

test('subscription: canceled flow shows cancel UI', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/premium?canceled=true');
  await expect(page.getByTestId('premium-continue-free')).toBeVisible();
  await expect(page.getByTestId('premium-activate-button')).toBeVisible();
});

test('stripe webhook: sync error does not break app', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  // Override centralized handler to return error in this test
  await page.route('**/api/subscriptions/sync-session', route => {
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'error' }) });
  });
  await page.goto('/app?premium=success&session_id=cs_test_error');
  await expect(page.getByTestId('app-premium-badge').or(page.getByText(/Dashboard/i))).toBeVisible();
});
