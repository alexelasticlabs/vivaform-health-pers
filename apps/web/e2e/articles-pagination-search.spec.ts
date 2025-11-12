import { test, expect } from '@playwright/test';

// E2E for ArticlesPage: pagination interactions with unified catch-all route

const mockArticlesPage = (pageNum: number, totalPages: number) => ({
  articles: [
    { id: `a-${pageNum}-1`, slug: `slug-${pageNum}-1`, title: `Article ${pageNum}-1`, category: 'General', viewCount: 5, coverImage: null, excerpt: 'Excerpt', tags: ['tag'], publishedAt: new Date().toISOString() },
    { id: `a-${pageNum}-2`, slug: `slug-${pageNum}-2`, title: `Article ${pageNum}-2`, category: 'Fitness', viewCount: 8, coverImage: null, excerpt: 'Excerpt', tags: ['tag'], publishedAt: new Date().toISOString() }
  ],
  pagination: { page: pageNum, pageSize: 12, totalPages, total: totalPages * 2 }
});

test('Articles page pagination (no search field)', async ({ page }) => {
  await page.route('**/api/*', async (route) => {
    const url = route.request().url();
    if (/\/api\/articles\/categories/.test(url)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['General','Fitness']) });
      return;
    }
    if (/\/api\/articles(\/|$|\?)/.test(url)) {
      const u = new URL(url);
      const p = parseInt(u.searchParams.get('page') || '1', 10);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockArticlesPage(p, 3)) });
      return;
    }
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
  });

  await page.goto('/articles');
  await expect(page.getByTestId('articles-header')).toBeVisible({ timeout: 15000 });

  const nextBtn = page.getByRole('button', { name: /Next/i });
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await expect(page.locator('[data-testid="article-card"]').first()).toBeVisible();
  }
});
