import { test, expect } from '@playwright/test';

// Mocked end-to-end flow: intercepts backend calls to emulate successful checkout
// Preconditions: web dev server is running on baseURL (default http://localhost:5173)

test('mock purchase flow shows success toast and cleans query', async ({ page, baseURL, context }) => {
  // Auth: inject persisted zustand store
  await page.addInitScript(() => {
    const state = { state: { profile: { id: 'u1', email: 't@e.com', tier: 'FREE' }, tokens: { accessToken: 'x', refreshToken: 'y' }, isAuthenticated: true } };
    window.localStorage.setItem('vivaform-auth', JSON.stringify(state));
  });

  // Intercept creating checkout session -> redirect to app success URL
  await page.route('**/subscriptions/checkout', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'cs_mock', url: `${baseURL}/app?premium=success&session_id=plw_mock` }) });
  });
  // Intercept sync after return -> pretend success
  await page.route('**/subscriptions/sync-session', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'ok' }) });
  });

  await page.goto(baseURL + '/premium');
  await page.getByRole('button', { name: /Activate VivaForm\+/i }).click();

  // Expect we landed on /app with success query
  await expect(page).toHaveURL(/\/app\?premium=success/);
  // Expect toast visible
  await expect(page.getByText(/VivaForm\+ activated|success/i)).toBeVisible();
  // After toast logic, query should be cleaned (app-shell replaces state)
  await page.waitForTimeout(300); // allow replaceState
  await expect(page).toHaveURL(/\/app(\?.*)?$/);
});

