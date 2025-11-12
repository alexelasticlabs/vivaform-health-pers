import { test, expect } from './fixtures';

// Dashboard KPI interactions using shared authenticated fixture

test.describe('Dashboard KPI interactions', () => {
  test('click calorie and macros cards are visible', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/app');
    await expect(page.getByText('Calories').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Macro Target|Macros/i).first()).toBeVisible();
  });

  test('hydration quick add buttons increment optimistic UI', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/app');
    const hydrationText = page.getByText(/ml$/).first();
    await expect(hydrationText).toBeVisible({ timeout: 15000 });
    const before = await hydrationText.textContent();
    await page.getByRole('button', { name: '+ 250 ml' }).click();
    await expect(hydrationText).not.toHaveText(before || '', { timeout: 5000 });
  });

  test('weight card opens modal', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/app');
    const updateBtn = page.getByRole('button', { name: /^Update$/i }).first();
    if (await updateBtn.isVisible().catch(() => false)) {
      await updateBtn.click();
      await expect(page.getByText('Update Weight')).toBeVisible({ timeout: 8000 });
      await expect(page.getByRole('button', { name: /Save weight/i })).toBeVisible();
    } else {
      const weight = page.getByText('Weight').first();
      await expect(weight).toBeVisible({ timeout: 15000 });
      await weight.click();
      await expect(page.getByText('Update Weight')).toBeVisible({ timeout: 8000 });
    }
  });
});
