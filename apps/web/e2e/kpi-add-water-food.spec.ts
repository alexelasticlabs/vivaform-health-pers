import { test, expect } from './fixtures';

test('KPI updates after adding water and food', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/app');
  const hydrationValue = page.getByTestId('kpi-value-hydration');
  await expect(hydrationValue).toBeVisible({ timeout: 15000 });
  const before = await hydrationValue.textContent();
  await page.getByRole('button', { name: '+ 250 ml' }).click();
  await expect(hydrationValue).not.toHaveText(before || '', { timeout: 5000 });
});
