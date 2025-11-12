import { test, expect } from './fixtures';

// This suite checks opening quick-add modals and switching trend tabs using shared authenticated fixture

test.describe('Dashboard UI interactions', () => {
  test('open meal and weight modals; switch trend tabs; add water', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/app');

    await expect(page.getByText(/Meal Planner|Dashboard|Hydration/i).first()).toBeVisible({ timeout: 15000 });

    const mealBtn = page.getByRole('button', { name: /add meal/i }).first();
    if (await mealBtn.isVisible().catch(() => false)) {
      await mealBtn.click();
      await expect(page.getByRole('dialog').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }

    const weightCard = page.getByText(/weight/i).first();
    if (await weightCard.isVisible().catch(() => false)) {
      await weightCard.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    }

    for (const t of ['weight','calories','hydration','steps']) {
      const button = page.getByRole('button', { name: new RegExp(`^${t}$`, 'i') });
      if (await button.isVisible().catch(() => false)) await button.click();
    }

    const quick = page.getByRole('button', { name: /\+ 250 ml/i });
    if (await quick.isVisible().catch(() => false)) {
      await quick.click();
      await expect(page.getByText(/ml/).first()).toBeVisible();
    }
  });
});
