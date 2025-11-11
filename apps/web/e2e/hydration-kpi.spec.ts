import { test, expect } from '@playwright/test';

// Precise KPI hydration increment validation

test('Hydration KPI increments by +250 ml', async ({ page }) => {
  // Mock dashboard daily endpoint with initial water=0 then after mutation water=250
  let waterTotal = 0;
  await page.route('**/api/dashboard/daily*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
        water: { totalMl: waterTotal },
        weight: { latest: null, progress: [] },
        recommendations: [],
        goals: { calories: 2000, protein: 150, fat: 60, carbs: 200, waterMl: 2000 },
        date: new Date().toISOString().slice(0,10)
      })
    });
  });
  await page.route('**/api/water', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      // Read requested amount from body if available
      try {
        const body = request.postDataJSON?.() ?? JSON.parse(request.postData() || '{}');
        const amount = Number(body?.amountMl ?? body?.amount ?? 0) || 250;
        waterTotal += amount;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'w1', amountMl: amount, date: new Date().toISOString() }) });
      } catch {
        waterTotal += 250;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'w1', amountMl: 250, date: new Date().toISOString() }) });
      }
      await page.evaluate(() => { window.dispatchEvent(new Event('focus')); });
    } else {
      await route.continue();
    }
  });
  await page.route('**/api/quiz/profile', async (route) => { await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }); });
  await page.route('**/api/auth/me', async (route) => { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', tier: 'FREE' }) }); });

  await page.goto('/app');

  const hydrationValue = page.getByTestId('kpi-value-hydration');
  await expect(hydrationValue).toHaveText(/0 ml/i);
  const plus250 = page.getByRole('button', { name: '+ 250 ml' });
  await plus250.click();
  await expect(hydrationValue).toHaveText(/250 ml/i, { timeout: 5000 });
  const plus500 = page.getByRole('button', { name: '+ 500 ml' });
  await plus500.click();
  await expect(hydrationValue).toHaveText(/750 ml/i, { timeout: 5000 });
});
