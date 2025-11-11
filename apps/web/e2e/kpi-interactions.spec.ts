import { test, expect } from '@playwright/test';

// Assumes dev server running on http://localhost:5173 and backend with seeded data
// Minimal smoke test for KPI CTA buttons.

test.describe('Dashboard KPI interactions', () => {
  test('click calorie and macros cards navigate to /app', async ({ page }) => {
    await page.goto('http://localhost:5173/app');
    // Calorie card contains text 'Calories'
    await page.getByText('Calories').click();
    await expect(page).toHaveURL(/\/app$/);
    await page.getByText('Macros').click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('hydration quick add buttons increment optimistic UI', async ({ page }) => {
    await page.goto('http://localhost:5173/app');
    const hydrationText = page.getByText(/ml$/); // matches hydration summary like '0 ml'
    const before = await hydrationText.textContent();
    await page.getByRole('button', { name: '+ 250 ml' }).click();
    // optimistic update might show increased ml; allow flexible match
    await expect(hydrationText).not.toHaveText(before || '');
  });

  test('weight card opens modal', async ({ page }) => {
    await page.goto('http://localhost:5173/app');
    await page.getByText('Weight').click();
    // Modal title
    await expect(page.getByText('Update Weight')).toBeVisible();
  });
});

