import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Eye, Tag } from "lucide-react";

import { getArticles, getArticleCategories, type ArticleListItem } from "@/api";

// Inline response type from articles API (fallback if no exported type)
interface ArticlesResponse {
  articles: ArticleListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
  };
}

export const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Reset page when category changes
  useEffect(() => { setPage(1); }, [selectedCategory]);

  const { data: articlesData, isLoading, isError, error, isFetching } = useQuery<ArticlesResponse, Error, ArticlesResponse, [string, string | undefined, number]>({
    queryKey: ["articles", selectedCategory, page],
    queryFn: async () => await getArticles(selectedCategory, page, 12) as ArticlesResponse
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ["article-categories"],
    queryFn: getArticleCategories
  });

  // Prefetch next page for smoother navigation
  useEffect(() => {
    const total = articlesData?.pagination?.totalPages;
    if (total && page < total) {
      void (async () => {
        await queryClient.prefetchQuery({
          queryKey: ["articles", selectedCategory, page + 1],
          queryFn: () => getArticles(selectedCategory, page + 1, 12)
        });
      })();
    }
  }, [articlesData, page, selectedCategory, queryClient]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold">Failed to load articles</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">{(error as Error)?.message || "Unknown error"}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["articles", selectedCategory, page] })}
            className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const noArticles = !isLoading && (!articlesData || articlesData.articles.length === 0);
  const showPagination = !!articlesData && articlesData.pagination.totalPages > 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8" data-testid="articles-header">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Health & Nutrition Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Expert articles about nutrition, fitness, and healthy living
          </p>
        </div>

        {/* Categories Filter */}
        {Array.isArray(categories) && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Articles
            </button>
            {categories?.map((category: string) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {isLoading && !articlesData ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 h-64 flex flex-col gap-3">
                <div className="h-28 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-auto flex gap-2">
                  <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : noArticles ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No articles found in this category
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articlesData!.articles.map((article: ArticleListItem) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  data-testid="article-card"
                  className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Cover Image */}
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        {article.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.viewCount}
                      </div>
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {showPagination && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 flex items-center text-sm">
                    Page {page} of {articlesData!.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= articlesData!.pagination.totalPages || isFetching}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                {isFetching && <p className="text-xs text-gray-500 dark:text-gray-400">Updating…</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};