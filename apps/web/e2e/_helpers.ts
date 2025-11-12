import { Page } from '@playwright/test';

export async function applyAuthAndDashboardMocks(page: Page, options: { waterTotal?: number; profileTier?: string } = {}) {
  // Inject auth into sessionStorage and bypass RequireAuth
  await page.addInitScript((tier) => {
    const state = {
      state: {
        profile: { id: 'u1', email: 'user@test.com', tier: tier || 'PREMIUM' },
        accessToken: 'access_mock_token',
        isAuthenticated: true
      },
      version: 0
    };
    window.sessionStorage.setItem('vivaform-auth', JSON.stringify(state));
    (window as any).__E2E_AUTH_OVERRIDE__ = true;
  }, options.profileTier);

  // Water total accumulator for dashboard widget
  let water = options.waterTotal ?? 0;

  // Dashboard daily
  await page.route('**/api/dashboard/daily*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
        water: { totalMl: water },
        weight: { latest: null },
        recommendations: [],
        goals: { calories: 2000, waterMl: 2000 },
        date: new Date().toISOString().slice(0, 10)
      })
    });
  });

  // Quiz profile (no data by default)
  await page.route('**/api/quiz/profile', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
  });
  await page.route('**/api/quiz/preview', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ clientId: 'cid', version: 1, answers: {}, savedAt: new Date().toISOString() }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, savedAt: new Date().toISOString() }) });
    }
  });

  // Weight & nutrition shortcuts
  await page.route('**/api/weight**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'w1', weightKg: 72, date: new Date().toISOString() }) });
    }
  });
  await page.route('**/api/nutrition**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'meal1' }) });
  });

  // Water endpoint: accumulate and trigger refetch
  await page.route('**/api/water', async (route) => {
    if (route.request().method() === 'POST') {
      try {
        const body = (route.request() as any).postDataJSON?.() ?? JSON.parse(route.request().postData() || '{}');
        const amount = Number(body?.amountMl ?? body?.amount ?? 250) || 250;
        water += amount;
      } catch {
        water += 250;
      }
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'water1', amountMl: 250 }) });
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ entries: [] }) });
    }
  });

  // Auth endpoints
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', email: 'user@test.com', tier: options.profileTier || 'PREMIUM' }) });
  });

  // Subscriptions endpoints
  await page.route('**/api/subscriptions/premium-view', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/api/subscriptions/checkout', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://checkout.example.com/session/mock' }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    }
  });
  await page.route('**/api/subscriptions/sync-session', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'ok' }) });
  });
  await page.route('**/api/subscriptions/history*', async (route) => {
    const url = new URL(route.request().url());
    const pageParam = Number(url.searchParams.get('page') || '1');
    const payload = {
      items: [
        { id: 'evt_1', action: 'SUBSCRIPTION_CREATED', createdAt: new Date().toISOString(), metadata: { amount: 990, currency: 'USD', priceId: 'price_basic' } },
        { id: 'evt_2', action: 'SUBSCRIPTION_UPGRADED', createdAt: new Date(Date.now() - 86400000).toISOString(), metadata: { amount: 2990, currency: 'USD', priceId: 'price_premium' } }
      ],
      total: 2,
      page: pageParam,
      pageSize: 10,
      hasNext: false
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });

  // Catch-all fallback for other API requests to prevent ECONNREFUSED
  await page.route('**/api/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
  });
}
