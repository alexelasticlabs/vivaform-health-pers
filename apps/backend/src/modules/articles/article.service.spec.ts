import { describe, it, expect, beforeEach } from 'vitest';
import { ArticleService } from './article.service';

class PrismaMock {
  article = {
    findUnique: vi.fn(),
    update: vi.fn(),
  } as any;
}

describe('ArticleService', () => {
  let service: ArticleService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = new PrismaMock();
    service = new ArticleService(prisma as any);
  });

  it('getArticleBySlug throws NotFound when not published or missing', async () => {
    prisma.article.findUnique.mockResolvedValueOnce(null);
    await expect(service.getArticleBySlug('slug')).rejects.toThrowError(/not found/);

    prisma.article.findUnique.mockResolvedValueOnce({ id: '1', published: false });
    await expect(service.getArticleBySlug('slug')).rejects.toThrowError(/not found/);
  });
});

