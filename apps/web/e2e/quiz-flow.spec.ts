import { test, expect } from '@playwright/test';

test('quiz: landing has CTA to start quiz', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: /get started|quiz/i });
  await expect(cta).toBeVisible();
});

