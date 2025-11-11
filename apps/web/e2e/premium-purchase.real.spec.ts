import { test, expect } from '@playwright/test';

// "Real-ish" flow: создаём реальную Stripe Checkout сессию (через ваш backend),
// но не вводим карту. После редиректа на Stripe возвращаемся на success URL
// вручную по session_id, вытащенному из ответа backend, и мокируем sync-session.
// Включается ТОЛЬКО при E2E_STRIPE_REAL=1, чтобы не запускалось случайно.

const runReal = process.env.E2E_STRIPE_REAL === '1';

(runReal ? test : test.skip)('real checkout: create session on backend, jump to success and show toast', async ({ page, baseURL }) => {
  // Auth: inject persisted store (zustand)
  await page.addInitScript(() => {
    const state = { state: { profile: { id: 'u1', email: 't@e.com', tier: 'FREE' }, tokens: { accessToken: 'x', refreshToken: 'y' }, isAuthenticated: true } };
    window.localStorage.setItem('vivaform-auth', JSON.stringify(state));
  });

  let createdSessionId: string | null = null;

  // Подслушиваем ответ от /subscriptions/checkout, чтобы достать session id
  const checkoutResponsePromise = page.waitForResponse((resp) => resp.url().includes('/subscriptions/checkout') && resp.request().method() === 'POST');

  // Мокаем sync-session, чтобы не зависеть от завершения оплаты на Stripe
  await page.route('**/subscriptions/sync-session', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'ok (real-checkout bypass)' }) });
  });

  await page.goto(baseURL + '/premium');
  await page.getByRole('button', { name: /Activate VivaForm\+/i }).click();

  // Ждём ответ backend и достаем id
  const checkoutResp = await checkoutResponsePromise;
  const body = await checkoutResp.json();
  createdSessionId = body?.id ?? null;
  expect(createdSessionId, 'checkout session id must be present').toBeTruthy();

  // Мы уже на странице Stripe (redirect), поэтому симулируем возврат на success URL вручную
  await page.goto(`${baseURL}/app?premium=success&session_id=${createdSessionId}`);

  // Должен показаться тост
  await expect(page.getByText(/VivaForm\+ activated|success/i)).toBeVisible();
  // И URL должен очиститься от query (replaceState)
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(/\/app(\?.*)?$/);
});

