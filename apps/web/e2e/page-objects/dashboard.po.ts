import { Page, Locator, expect } from '@playwright/test';

export class DashboardPagePO {
  constructor(private readonly page: Page) {}

  // elements
  get welcome() { return this.page.getByText(/Welcome back/i); }
  get addMealButton() { return this.page.getByRole('button', { name: /add meal/i }); }
  get hydrationValue() { return this.page.getByTestId('kpi-value-hydration'); }
  get addWater250() { return this.page.getByRole('button', { name: '+ 250 ml' }); }
  get addWater500() { return this.page.getByRole('button', { name: '+ 500 ml' }); }
  get weightUpdate() { return this.page.getByRole('button', { name: /^Update$/i }).first(); }
  get weightHeading() { return this.page.getByRole('heading', { name: /Update Weight/i }); }
  get closeButton() { return this.page.getByRole('button', { name: /close/i }).first(); }

  // actions
  async goto() { await this.page.goto('/app'); }
  async ensureLoaded() { await expect(this.welcome).toBeVisible({ timeout: 20000 }); }
}

