import { test as base, expect } from '@playwright/test';
import { test } from './fixtures';

// Простой smoke-тест: без авторизации /premium/history должно редиректить на /login
// Для полной e2e авторизации используем общую фикстуру.

base('premium history redirects to login when unauthenticated', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/premium/history');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/log in|sign in/i)).toBeVisible();
});

test('premium history opens for authenticated user', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/premium/history');
  await expect(page.getByTestId('premium-history-title')).toBeVisible();
});
