import { test, expect } from '@playwright/test';

// Basic auth flow: visit login, attempt invalid, see error (with mocked backend response)

test('auth: invalid login shows error', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Incorrect password' }) });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('nonexistent@example.com');
  await page.getByLabel('Password').fill('WrongPassword123');
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page.getByText(/incorrect password|doesn't seem right/i)).toBeVisible({ timeout: 5000 });
});
