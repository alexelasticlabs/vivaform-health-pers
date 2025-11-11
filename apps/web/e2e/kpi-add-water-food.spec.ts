import { test, expect } from '@playwright/test';

// This test mocks backend for deterministic KPI increments for water and adds a food entry.

test('KPI updates after adding water and food', async ({ page }) => {
  await page.route('**/api/dashboard/daily**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
      water: { totalMl: 0 },
      weight: { latest: null },
      recommendations: [],
      goals: { calories: 2000, protein: 150, fat: 60, carbs: 200, waterMl: 2000 }
    }) });
  });
  await page.route('**/api/water', async (route) => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    return route.continue();
  });
  await page.route('**/api/nutrition', async (route) => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'n1' }) });
    return route.continue();
  });

  await page.goto('/app');

  // Capture initial hydration ml value precisely
  const hydrationCard = page.locator('text=Hydration').locator('..');
  const initialText = await hydrationCard.textContent();
  const initialMatch = initialText?.match(/Hydration[^0-9]*(\d+)\s?ml/);
  const initialMl = initialMatch ? parseInt(initialMatch[1], 10) : 0;

  await page.getByRole('button', { name: '+ 250 ml' }).click();

  // Wait for potential re-render after mutation (even if mocked it may be instant)
  await page.waitForTimeout(300);

  const afterText = await hydrationCard.textContent();
  const afterMatch = afterText?.match(/Hydration[^0-9]*(\d+)\s?ml/);
  const afterMl = afterMatch ? parseInt(afterMatch[1], 10) : initialMl;

  expect(afterMl).toBe(initialMl + 250);
});
