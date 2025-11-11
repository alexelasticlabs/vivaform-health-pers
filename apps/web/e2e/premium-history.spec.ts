import { test, expect } from '@playwright/test';

// Простой smoke-тест: без авторизации /premium/history должно редиректить на /login
// Для полной e2e авторизации потребуются фикстуры токенов/бэкенда.

test('premium history redirects to login when unauthenticated', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/premium/history');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/log in|sign in/i)).toBeVisible();
});

