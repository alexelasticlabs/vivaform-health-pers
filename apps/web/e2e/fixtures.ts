import { test as base, expect, Page } from '@playwright/test';
import { applyAuthAndDashboardMocks } from './_helpers';

// Extended fixture: authenticatedPage с подставленными моками Auth/Subscriptions/Quiz/Dashboard
export const test = base.extend<{ authenticatedPage: Page }>(
  {
    authenticatedPage: async ({ page }, use) => {
      await applyAuthAndDashboardMocks(page, { profileTier: 'FREE', waterTotal: 0 });
      await use(page);
    }
  }
);

export { expect };
