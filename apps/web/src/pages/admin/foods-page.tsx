import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, CheckCircle, XCircle, Trash2, Eye, Search } from 'lucide-react';
import { getAdminFoodItems, verifyFoodItem, deleteFoodItem } from '@/api/admin';
import { extractErrorMessage } from '@/api/errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/admin/pagination';
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar';

type FoodItem = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  verified: boolean;
  createdBy: {
    email: string;
    name: string | null;
  };
  createdAt: string;
};

export function AdminFoodsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const limit = 20;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'foods', filter, page],
    queryFn: () => getAdminFoodItems(filter, page, limit),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ foodId, verified }: { foodId: string; verified: boolean }) =>
      verifyFoodItem(foodId, verified),
    onSuccess: () => {
      toast.success('Food item updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'foods'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (foodId: string) => deleteFoodItem(foodId),
    onSuccess: () => {
      toast.success('Food item deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'foods'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const handleVerify = (foodId: string, currentVerified: boolean) => {
    verifyMutation.mutate({ foodId, verified: !currentVerified });
  };

  const handleDelete = (foodId: string, foodName: string) => {
    if (confirm(`Delete "${foodName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(foodId);
    }
  };

  const handleBulkVerify = () => {
    Array.from(selectedItems).forEach((id) => {
      verifyMutation.mutate({ foodId: id, verified: true });
    });
    setSelectedItems(new Set());
  };

  const handleBulkReject = () => {
    Array.from(selectedItems).forEach((id) => {
      verifyMutation.mutate({ foodId: id, verified: false });
    });
    setSelectedItems(new Set());
  };

  const handleSelectItem = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const filteredFoods = data?.foods.filter((food: FoodItem) =>
    search ? food.name.toLowerCase().includes(search.toLowerCase()) : true
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Food Items Moderation</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Review and verify user-submitted food items
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search food items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(undefined)}
              >
                All ({data?.pagination.total || 0})
              </Button>
              <Button
                variant={filter === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(true)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Verified
              </Button>
              <Button
                variant={filter === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(false)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedItems.size}
        totalCount={filteredFoods.length}
        onSelectAll={() => setSelectedItems(new Set(filteredFoods.map((f: FoodItem) => f.id)))}
        onDeselectAll={() => setSelectedItems(new Set())}
        actions={[
          {
            label: 'Approve',
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: handleBulkVerify,
            variant: 'default',
          },
          {
            label: 'Reject',
            icon: <XCircle className="h-4 w-4" />,
            onClick: handleBulkReject,
            variant: 'outline',
          },
        ]}
      />

      {/* Food Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Food Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="space-y-2">
              {filteredFoods.map((food: FoodItem) => (
                <div
                  key={food.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(food.id)}
                    onChange={() => handleSelectItem(food.id)}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{food.name}</span>
                      {food.brand && (
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          ({food.brand})
                        </span>
                      )}
                      {food.verified ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span>{food.category}</span>
                      <span>•</span>
                      <span>{food.caloriesPer100g} kcal/100g</span>
                      <span>•</span>
                      <span>P: {food.proteinPer100g}g</span>
                      <span>C: {food.carbsPer100g}g</span>
                      <span>F: {food.fatPer100g}g</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Added by {food.createdBy.name || food.createdBy.email} on{' '}
                      {new Date(food.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(food.id, food.verified)}
                    >
                      {food.verified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(food.id, food.name)}
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
              No food items found
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
    </div>
  );
}

