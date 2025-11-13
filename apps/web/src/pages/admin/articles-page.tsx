import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { listArticles, createArticle, updateArticle, deleteArticle, publishArticle, unpublishArticle, type Article, type ArticleFormData } from '@/api/admin-articles';
import { extractErrorMessage } from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FilterBar, type FilterConfig } from '@/components/admin/filter-bar';
import { Pagination } from '@/components/admin/pagination';

const filterConfigs: FilterConfig[] = [
  {
    key: 'q',
    label: 'Search',
    type: 'search',
    placeholder: 'Search articles...',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Published', value: 'PUBLISHED' },
      { label: 'Draft', value: 'DRAFT' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Nutrition', value: 'nutrition' },
      { label: 'Fitness', value: 'fitness' },
      { label: 'Wellness', value: 'wellness' },
      { label: 'Recipes', value: 'recipes' },
    ],
  },
];

export function AdminArticlesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({
    q: '',
    status: '',
    category: '',
  });
  const [editDialog, setEditDialog] = useState<{ mode: 'create' | 'edit'; article?: Article } | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: 'nutrition',
    tags: [],
    status: 'DRAFT',
  });
  const limit = 20;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'articles', filters, page],
    queryFn: () => listArticles({ ...filters, page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: (article: ArticleFormData) => createArticle(article),
    onSuccess: () => {
      toast.success('Article created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      setEditDialog(null);
      resetForm();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ArticleFormData> }) => updateArticle(id, data),
    onSuccess: () => {
      toast.success('Article updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      setEditDialog(null);
      resetForm();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      toast.success('Article deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? publishArticle(id) : unpublishArticle(id),
    onSuccess: () => {
      toast.success('Article status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ q: '', status: '', category: '' });
    setPage(1);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'nutrition',
      tags: [],
      status: 'DRAFT',
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditDialog({ mode: 'create' });
  };

  const openEditDialog = (article: Article) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      imageUrl: article.imageUrl || '',
      category: article.category,
      tags: article.tags,
      status: article.status,
      featured: article.featured,
    });
    setEditDialog({ mode: 'edit', article });
  };

  const handleSubmit = () => {
    if (editDialog?.mode === 'create') {
      createMutation.mutate(formData);
    } else if (editDialog?.article) {
      updateMutation.mutate({ id: editDialog.article.id, data: formData });
    }
  };

  const handleDelete = (article: Article) => {
    if (confirm(`Delete "${article.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(article.id);
    }
  };

  const handleTogglePublish = (article: Article) => {
    publishMutation.mutate({ id: article.id, publish: article.status !== 'PUBLISHED' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Articles</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage blog articles and content
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            filters={filterConfigs}
            values={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Articles ({data?.pagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="space-y-3">
              {data.items.map((article: Article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{article.title}</h3>
                      <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                      {article.featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.viewCount} views</span>
                      <span>•</span>
                      <span>By {article.author.name || article.author.email}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(article)}
                      title={article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    >
                      {article.status === 'PUBLISHED' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-500">
              No articles found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          loading={isLoading}
        />
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog?.mode === 'create' ? 'Create Article' : 'Edit Article'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary..."
                className="w-full rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Article content (Markdown supported)..."
                className="w-full rounded-lg border border-neutral-200 p-3 text-sm font-mono dark:border-neutral-800"
                rows={10}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="nutrition"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Image URL</label>
                <Input
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="nutrition, health, wellness"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.status === 'PUBLISHED'}
                  onChange={(e) => setFormData({
                    ...formData,
                    status: e.target.checked ? 'PUBLISHED' : 'DRAFT'
                  })}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-sm font-medium">Publish immediately</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.excerpt || !formData.content}
            >
              {editDialog?.mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

