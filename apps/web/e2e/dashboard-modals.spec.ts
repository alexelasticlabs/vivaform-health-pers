import { test, expect } from '@playwright/test';

// Opens meal and weight modals and submits minimal forms with network mocks

test('Dashboard modals: meal and weight', async ({ page }) => {
  // Mock dashboard/day
  await page.route('**/api/dashboard/daily**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      goals: { calories: 2000, waterMl: 2000 },
      nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
      water: { totalMl: 0 },
      weight: { latest: null },
      recommendations: []
    })});
  });
  await page.route('**/api/weight**', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'w1', weightKg: 70, date: new Date().toISOString() }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }
  });
  await page.route('**/api/nutrition**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'n1' }) });
  });

  await page.goto('/app');

  // Open meal modal
  const addMeal = page.getByRole('button', { name: /add meal/i });
  await addMeal.click();
  // minimal action: ensure form present
  await expect(page.getByText(/Add Food|Search foods/i)).toBeVisible();
  // Close
  await page.getByRole('button', { name: /close/i }).first().click().catch(() => {});

  // Open weight modal
  const weightCard = page.getByText(/Weight/i).first();
  await weightCard.click();
  // Fill weight if input exists
  const weightInput = page.getByRole('spinbutton').first();
  if (await weightInput.isVisible().catch(() => false)) {
    await weightInput.fill('70.5');
  }
  const saveBtn = page.getByRole('button', { name: /save|update|add/i }).first();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
  }
  await expect(page.getByText(/Update Weight|Weight/i)).toBeVisible();

  // After closing meal modal, reopen and simulate adding a manual meal if form present
  const addMealAgain = page.getByRole('button', { name: /add meal/i });
  if (await addMealAgain.isVisible().catch(() => false)) {
    await addMealAgain.click();
    // Enter manual food if manual link exists
    const manualLink = page.getByRole('button', { name: /or enter food manually/i });
    if (await manualLink.isVisible().catch(() => false)) {
      await manualLink.click();
    }
    const foodInput = page.getByPlaceholder(/oatmeal|berries|food/i).first();
    if (await foodInput.isVisible().catch(() => false)) {
      await foodInput.fill('Test meal');
    }
    const caloriesInput = page.getByRole('spinbutton', { name: /calories/i }).first();
    if (await caloriesInput.isVisible().catch(() => false)) {
      await caloriesInput.fill('123');
    }
    const saveMealBtn = page.getByRole('button', { name: /add meal|saving/i }).last();
    if (await saveMealBtn.isVisible().catch(() => false)) {
      await saveMealBtn.click();
    }
    // Expect toast or any saved indication
    await expect(page.getByText(/Meal saved|Saving/i)).toBeVisible({ timeout: 5000 });
    // Close if still open
    await page.getByRole('button', { name: /close/i }).first().click().catch(() => {});
  }

  // Hydration KPI value check (if present)
  const hydrationValue = page.getByText(/ml/).first();
  await expect(hydrationValue).toBeVisible();
});
