import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/api', async (importOriginal: any) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getArticleBySlug: vi.fn().mockResolvedValue({
      id: 'a1',
      title: 'Title',
      slug: 'title',
      excerpt: 'Excerpt',
      category: 'Cat',
      coverImage: null,
      tags: ['x'],
      publishedAt: new Date().toISOString(),
      viewCount: 1,
      author: { name: 'Author' },
      content: '<script>window.__XSS__=1</script><p>Hello <img src="/test.png" alt="x" onerror="alert(1)" /></p>'
    })
  };
});

import { ArticleDetailPage } from '@/pages/article-detail-page';

describe('ArticleDetailPage XSS sanitization', () => {
  it('removes script tags and dangerous attributes', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/articles/title']}>\n          <Routes>\n            <Route path='/articles/:slug' element={<ArticleDetailPage />} />\n          </Routes>\n        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for content
    const paragraph = await screen.findByText('Hello');
    expect(paragraph).toBeInTheDocument();
    // Script should be removed
    expect(document.querySelector('script')).toBeNull();
    // onerror should be stripped (DOMPurify removes dangerous attrs)
    const img = document.querySelector('img');
    if (img) {
      expect(img.getAttribute('onerror')).toBeNull();
    }
    expect((window as any).__XSS__).toBeUndefined();
  });
});
