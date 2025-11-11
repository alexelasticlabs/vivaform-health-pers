import { test, expect } from '@playwright/test';

// Простая проверка вход/выход: используем персист хранилища (zustand) и кликаем Logout

test('auth flow: open dashboard and logout to login page', async ({ page, baseURL }) => {
  // Inject persisted store
  await page.addInitScript(() => {
    const state = { state: { profile: { id: 'u1', email: 't@e.com', tier: 'FREE' }, tokens: { accessToken: 'x', refreshToken: 'y' }, isAuthenticated: true } };
    window.localStorage.setItem('vivaform-auth', JSON.stringify(state));
  });

  await page.goto(baseURL + '/app');
  await expect(page.getByText(/Dashboard|My plan|Recommendations/i)).toBeVisible();

  // Открыть меню пользователя и нажать Logout
  await page.getByRole('button', { name: /user menu|menu/i }).click({ trial: true }).catch(() => {});
  // В интерфейсе кнопка Logout доступна напрямую в меню
  await page.getByRole('button', { name: /logout/i }).click();

  // Ожидаем переход на страницу логина
  await expect(page).toHaveURL(/\/login/);
});

