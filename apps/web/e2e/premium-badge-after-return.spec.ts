import { test, expect } from '@playwright/test';

// Проверяем, что после возврата с Stripe (premium=success&session_id=...)
// бейдж VivaForm+ появляется без перезагрузки страницы, а URL очищается.

test('VivaForm+ badge appears after Stripe return without reload', async ({ page, baseURL }) => {
  // Подготовка авторизации: кладём zustand state в localStorage
  await page.addInitScript(() => {
    const state = {
      state: {
        profile: { id: 'u1', email: 't@e.com', tier: 'FREE' },
        tokens: { accessToken: 'x', refreshToken: 'y' },
        isAuthenticated: true
      }
    };
    window.localStorage.setItem('vivaform-auth', JSON.stringify(state));
  });

  // Мокаем sync-session: отвечаем успешно
  await page.route('**/subscriptions/sync-session', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'ok' }) });
  });

  // Заходим на app с success query, как будто вернулись со Stripe
  await page.goto(`${baseURL}/app?premium=success&session_id=cs_mock_123`);

  // Ждём пока zustand store обновит tier в localStorage
  await page.waitForFunction(() => {
    try {
      const raw = window.localStorage.getItem('vivaform-auth');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed.state?.profile?.tier === 'PREMIUM';
    } catch { return false; }
  });

  // Должен появиться бейдж VivaForm+ в AppShell (ждём ререндер)
  const badge = page.locator('[data-testid="app-premium-badge"]');
  await expect(badge).toBeVisible();

  // URL должен быть очищен от query
  await page.waitForTimeout(200);
  await expect(page).toHaveURL(/\/app(\?.*)?$/);
});
