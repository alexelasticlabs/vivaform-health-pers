import { apiClient } from "./client";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  viewCount: number;
  author: {
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  tags: string[];
  publishedAt?: string;
  viewCount: number;
  author: {
    name: string;
  };
}

export const getArticles = async (category?: string, page = 1, limit = 20) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await apiClient.get(`/articles?${params.toString()}`);
  return response.data;
};

export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await apiClient.get(`/articles/${slug}`);
  return response.data;
};

export const getArticleCategories = async (): Promise<string[]> => {
  const response = await apiClient.get("/articles/categories");
  return response.data;
};