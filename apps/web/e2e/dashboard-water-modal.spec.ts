import { test, expect } from './fixtures';

test('Open water quick add via KPI', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/app');
  const add250 = page.getByRole('button', { name: '+ 250 ml' });
  await expect(add250).toBeVisible({ timeout: 15000 });
  await add250.click();
  await expect(page.getByTestId('kpi-value-hydration')).toBeVisible();
});
