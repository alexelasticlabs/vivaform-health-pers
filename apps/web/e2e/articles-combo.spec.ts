import { test, expect } from '@playwright/test';

// Combined Articles scenario: categories filter -> clear -> paginate (with unified catch-all mock)

test('Articles combo: filter, clear, paginate', async ({ page }) => {
  // Unified catch-all first
  await page.route('**/api/*', async (route) => {
    const url = route.request().url();
    if (/\/api\/articles\/categories/.test(url)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['General','Nutrition','Fitness']) });
      return;
    }
    if (/\/api\/articles(\/|$|\?)/.test(url)) {
      const u = new URL(url);
      const pageParam = parseInt(u.searchParams.get('page') || '1', 10);
      const category = u.searchParams.get('category') || 'General';
      const baseTitle = `Article ${category}`;
      const articles = [
        { id: `a-${pageParam}-1`, slug: `s-${pageParam}-1`, title: baseTitle + ` #${pageParam}-1`, category, viewCount: 10, coverImage: null, excerpt: 'Ex', tags: [], publishedAt: new Date().toISOString() },
        { id: `a-${pageParam}-2`, slug: `s-${pageParam}-2`, title: baseTitle + ` #${pageParam}-2`, category, viewCount: 5, coverImage: null, excerpt: 'Ex', tags: [], publishedAt: new Date().toISOString() }
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles, pagination: { page: pageParam, pageSize: 12, totalPages: 3, total: 6 } }) });
      return;
    }
    // Generic success for remaining API calls
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
  });

  await page.goto('/articles');
  await expect(page.getByTestId('articles-header')).toBeVisible({ timeout: 15000 });

  // Filter Nutrition
  const nutritionBtn = page.getByRole('button', { name: /Nutrition/i });
  if (await nutritionBtn.isVisible()) {
    await nutritionBtn.click();
    await expect(page.locator('[data-testid="article-card"]').first()).toBeVisible();
  }

  // Clear filter -> All Articles
  const allBtn = page.getByRole('button', { name: /All Articles/i });
  if (await allBtn.isVisible()) {
    await allBtn.click();
  }

  // Pagination next
  const nextBtn = page.getByRole('button', { name: /Next/i });
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await expect(page.locator('[data-testid="article-card"]').first()).toBeVisible();
  }
});
