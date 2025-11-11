import { test, expect } from '@playwright/test';

// Простой smoke-тест: без авторизации /premium/history должно редиректить на /login
// Для полной e2e авторизации потребуются фикстуры токенов/бэкенда.

test('premium history redirects to login when unauthenticated', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/premium/history');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/log in|sign in/i)).toBeVisible();
});

test('premium history opens for authenticated user', async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    const state = { state: { profile: { id: 'u1', email: 't@e.com', tier: 'FREE' }, tokens: { accessToken: 'x', refreshToken: 'y' }, isAuthenticated: true } };
    window.localStorage.setItem('vivaform-auth', JSON.stringify(state));
  });
  await page.goto(baseURL + '/premium/history');
  await expect(page.getByText(/Premium history/i)).toBeVisible();
});
