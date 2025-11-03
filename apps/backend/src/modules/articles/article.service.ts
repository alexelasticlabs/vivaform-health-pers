import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

interface UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Генерация slug из заголовка
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  /**
   * Создать статью (только admin)
   */
  async createArticle(authorId: string, data: CreateArticleDto) {
    const slug = this.generateSlug(data.title);

    // Проверка уникальности slug
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Article with slug "${slug}" already exists`);
    }

    return this.prisma.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        coverImage: data.coverImage,
        tags: data.tags || [],
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Получить все опубликованные статьи
   */
  async getPublishedArticles(category?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = { published: true };
    if (category) {
      where.category = category;
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          coverImage: true,
          tags: true,
          publishedAt: true,
          viewCount: true,
          author: {
            select: {
              name: true
            }
          }
        },
        orderBy: { publishedAt: "desc" }
      }),
      this.prisma.article.count({ where })
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Получить все статьи (включая неопубликованные) - только admin
   */
  async getAllArticles(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.article.count()
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Получить статью по slug
   */
  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    // Увеличить счетчик просмотров
    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    return article;
  }

  /**
   * Получить категории статей
   */
  async getCategories() {
    const articles = await this.prisma.article.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"]
    });

    return articles.map((a) => a.category).sort();
  }

  /**
   * Обновить статью (только admin)
   */
  async updateArticle(articleId: string, data: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const updateData: any = { ...data };

    // Если меняем статус на published и статья еще не опубликована
    if (data.published && !article.published) {
      updateData.publishedAt = new Date();
    }

    // Если меняем заголовок, обновляем slug
    if (data.title && data.title !== article.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    return this.prisma.article.update({
      where: { id: articleId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Удалить статью (только admin)
   */
  async deleteArticle(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return this.prisma.article.delete({
      where: { id: articleId }
    });
  }
}