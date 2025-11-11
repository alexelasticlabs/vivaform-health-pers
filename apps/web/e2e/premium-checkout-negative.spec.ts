import { test, expect } from '@playwright/test';

// Negative checkout scenario: network error

test('Premium checkout negative (network error)', async ({ page }) => {
  await page.route('**/api/subscriptions/premium-view**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.route('**/api/subscriptions/checkout**', async (route) => {
    await route.abort(); // simulate network failure
  });
  await page.goto('/premium');
  const checkoutBtn = page.getByRole('button', { name: /get premium|upgrade|checkout/i }).first();
  await checkoutBtn.click();
  // Expect toast or error indicator (generic selector; adjust if toast has role)
  await expect(page.getByText(/Network Error|Failed|Ошибка/i)).toBeVisible();
});

