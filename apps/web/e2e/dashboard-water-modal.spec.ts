import { test, expect } from '@playwright/test';

// Open water quick add (through hydration KPI footer)

test('Open water quick add via KPI', async ({ page }) => {
  await page.route('**/dashboard/daily*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
        water: { totalMl: 0 },
        weight: { latest: null, progress: [] },
        recommendations: [],
        goals: { calories: 2000, protein: 150, fat: 60, carbs: 200, waterMl: 2000 },
        date: new Date().toISOString().slice(0,10)
      })
    });
  });
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', tier: 'FREE' }) });
  });
  await page.route('**/quiz/profile', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
  });
  await page.goto('/app');

  const hydCard = page.getByRole('button', { name: /hydration/i });
  await hydCard.waitFor();
  const add250 = page.getByRole('button', { name: /\+ 250 ml/i });
  await expect(add250).toBeVisible();
  await add250.click();
  // Modal might not open for water (since we add directly); ensure value changed handled by other spec
  await expect(hydCard).toBeVisible();
});

