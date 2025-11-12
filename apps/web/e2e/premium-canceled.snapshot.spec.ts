import { test, expect } from './fixtures';

// Snapshot-style check for canceled premium flow UI elements

test('premium canceled snapshot elements', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/premium?canceled=true');
  await expect(page.getByTestId('premium-continue-free')).toBeVisible();
  await expect(page.getByTestId('premium-activate-button')).toBeVisible();
  await expect(page.getByTestId('premium-plans-section')).toBeVisible();
});
