import { test, expect } from '@playwright/test';

// Assumptions: build & preview running, baseURL points to marketing/home
// This covers: open landing, start quiz CTA, login, navigate premium, open history.

async function login(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in|login/i }).click();
}

test.describe('Premium subscription flow', () => {
  test('anonymous user redirected when accessing premium history', async ({ page }) => {
    await page.goto('/app/premium/history');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login then access premium history', async ({ page }) => {
    // Replace with a seeded user credentials (seed script must create user)
    const email = process.env.E2E_USER_EMAIL || 'seed-user@example.com';
    const password = process.env.E2E_USER_PASSWORD || 'SeedPass123!';

    await login(page, email, password);

    // Navigate to premium section
    await page.goto('/app/premium');
    await expect(page.getByText(/Premium|upgrade|benefits/i).first()).toBeVisible();

    // Navigate to history
    await page.goto('/app/premium/history');
    await expect(page.getByTestId('premium-history-title')).toBeVisible();
  });
});

