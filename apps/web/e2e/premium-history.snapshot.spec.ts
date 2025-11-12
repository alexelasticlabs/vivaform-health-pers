import { test, expect } from './fixtures';

// Snapshot-like test using shared mocks & auth override

test('premium history snapshot with auth override', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/premium/history');

  // Presence checks via testids
  await expect(page.getByTestId('premium-history-title')).toBeVisible();
  await expect(page.getByTestId('premium-history-list')).toBeVisible();

  // Check mocked subscription events are visible using action testid
  const actions = page.getByTestId('premium-history-action');
  await expect(actions.nth(0)).toContainText(/created/i);
  await expect(actions.nth(1)).toContainText(/upgraded/i);

  // Verify price pill present via testid
  await expect(page.getByTestId('premium-history-priceId').first()).toBeVisible();
});
