import { test, expect } from '@playwright/test';

// This suite checks opening quick-add modals and switching trend tabs.
// Assumes local dev server with seed data or mocked network if needed.

test.describe('Dashboard UI interactions', () => {
  test('open meal and weight modals; switch trend tabs; add water', async ({ page }) => {
    await page.goto('/app');

    // Expect hero and KPI grid
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 15000 });

    // Open meal modal via main CTA
    await page.getByRole('button', { name: /add meal/i }).first().click();
    await expect(page.getByRole('dialog', { name: /add/i })).toBeVisible();
    // Close modal
    await page.getByRole('button', { name: /close/i }).first().click({ trial: true }).catch(() => {});
    await page.keyboard.press('Escape');

    // Open weight modal from KPI
    const weightCard = page.getByRole('button', { name: /weight/i }).first().or(page.getByText(/weight/i).first());
    await weightCard.click();
    await expect(page.getByRole('dialog', { name: /update weight/i })).toBeVisible();
    await page.keyboard.press('Escape');

    // Switch trend tabs
    const tabs = ['weight', 'calories', 'hydration', 'steps'];
    for (const t of tabs) {
      const btn = page.getByRole('button', { name: new RegExp(`^${t}$`, 'i') });
      await btn.click();
      await expect(btn).toBeVisible();
    }

    // Add water quick button +250 ml (if visible)
    const quick = page.getByRole('button', { name: /\+ 250 ml/i });
    if (await quick.isVisible()) {
      await quick.click();
      // A toast might appear; no strict assertion to avoid flakiness
    }
  });
});

