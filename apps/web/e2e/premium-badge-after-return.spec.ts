import { test, expect } from './fixtures';

// Проверяем, что после возврата с Stripe (premium=success&session_id=...)
// бейдж VivaForm+ появляется без перезагрузки страницы, а URL очищается.

test('VivaForm+ badge appears after Stripe return without reload', async ({ authenticatedPage, baseURL }) => {
  const page = authenticatedPage;

  // Заходим на app с success query, как будто вернулись со Stripe
  await page.goto(`${baseURL}/app?premium=success&session_id=cs_mock_123`);

  // Ждём пока zustand store (sessionStorage) обновит tier
  await page.waitForFunction(() => {
    try {
      const raw = window.sessionStorage.getItem('vivaform-auth');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed.state?.profile?.tier === 'PREMIUM';
    } catch { return false; }
  });

  // Должен появиться бейдж VivaForm+ в AppShell (ждём ререндер)
  const badge = page.locator('[data-testid="app-premium-badge"]');
  await expect(badge).toBeVisible();

  // URL должен быть очищен от query
  await expect(page).toHaveURL(/\/app(\?.*)?$/);
});
