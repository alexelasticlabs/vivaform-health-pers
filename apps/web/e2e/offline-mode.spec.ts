import { test, expect } from './fixtures';

test('offline: shows offline banner on network failure', async ({ authenticatedPage, context }) => {
  await context.route('**/api/**', route => route.abort());
  await authenticatedPage.goto('/app');
  await expect(authenticatedPage.getByText(/Backend недоступен|server is unreachable|offline/i)).toBeVisible();
});
