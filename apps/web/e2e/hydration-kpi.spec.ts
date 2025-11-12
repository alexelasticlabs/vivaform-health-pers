import { test, expect } from './fixtures';
import { DashboardPagePO } from './page-objects/dashboard.po';

test('Dashboard loads and shows hydration KPI', async ({ authenticatedPage }) => {
  const dash = new DashboardPagePO(authenticatedPage);
  await dash.goto();
  await dash.ensureLoaded();
  await expect(dash.hydrationValue).toBeVisible({ timeout: 15000 });
});

test('Water logging button is clickable', async ({ authenticatedPage }) => {
  const dash = new DashboardPagePO(authenticatedPage);
  await dash.goto();
  await dash.ensureLoaded();

  await expect(dash.addWater250).toBeVisible();
  await dash.addWater250.click();
  await expect(dash.hydrationValue).toBeVisible();
});
