import { test, expect } from '@playwright/test';

// E2E for ArticlesPage: pagination + search interactions with mocked endpoints.

const mockArticlesPage = (page: number, totalPages: number, query?: string) => ({
  articles: [
    { id: `a-${page}-1`, slug: `slug-${page}-1`, title: query ? `Match ${query}` : `Article ${page}-1`, category: 'General', viewCount: 5, coverImage: null, excerpt: 'Excerpt', tags: ['tag'], publishedAt: new Date().toISOString() },
    { id: `a-${page}-2`, slug: `slug-${page}-2`, title: `Article ${page}-2`, category: 'Fitness', viewCount: 8, coverImage: null, excerpt: 'Excerpt', tags: ['tag'], publishedAt: new Date().toISOString() }
  ],
  pagination: { page, pageSize: 12, totalPages, total: totalPages * 2 }
});

test('Articles page pagination and search', async ({ page }) => {
  await page.route('**/api/articles/categories', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['General', 'Fitness']) });
  });

  await page.route('**/api/articles**', async (route) => {
    const url = new URL(route.request().url());
    const p = parseInt(url.searchParams.get('page') || '1', 10);
    const q = url.searchParams.get('query') || undefined;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockArticlesPage(p, 3, q)) });
  });

  await page.goto('/articles');
  await expect(page.getByText(/Health & Nutrition Library/i)).toBeVisible();

  // Navigate to page 2
  const nextBtn = page.getByRole('button', { name: /Next/i });
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await expect(page.locator('text=Article 2-1')).toBeVisible();
  }

  // Perform search
  const searchInput = page.getByPlaceholder(/Search articles/i);
  await searchInput.fill('Omega');
  await searchInput.press('Enter');
  await expect(page.getByText(/Match Omega/i)).toBeVisible();
});

