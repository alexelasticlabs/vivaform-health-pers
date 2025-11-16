import { apiClient } from './client';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  viewCount: number;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFormData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
}

export const listArticles = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  q?: string;
}) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) usp.set(k, String(v));
  }
  const { data } = await apiClient.get(`/articles?${usp.toString()}`);
  return data;
};

export const getArticle = async (id: string) => {
  const { data } = await apiClient.get(`/articles/${id}`);
  return data;
};

export const createArticle = async (article: ArticleFormData) => {
  const { data } = await apiClient.post('/admin/articles', article);
  return data;
};

export const updateArticle = async (id: string, article: Partial<ArticleFormData>) => {
  const { data } = await apiClient.patch(`/admin/articles/${id}`, article);
  return data;
};

export const deleteArticle = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/articles/${id}`);
  return data;
};

export const publishArticle = async (id: string) => {
  const { data } = await apiClient.patch(`/admin/articles/${id}`, { status: 'PUBLISHED' });
  return data;
};

export const unpublishArticle = async (id: string) => {
  const { data } = await apiClient.patch(`/admin/articles/${id}`, { status: 'DRAFT' });
  return data;
};

