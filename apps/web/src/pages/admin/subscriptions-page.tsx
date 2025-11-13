import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { listSubscriptions } from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterBar, type FilterConfig } from '@/components/admin/filter-bar';
import { Pagination } from '@/components/admin/pagination';

type Subscription = {
  id: string;
  status: string;
  plan: string;
  stripePriceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Canceled', value: 'CANCELED' },
      { label: 'Past Due', value: 'PAST_DUE' },
    ],
  },
  {
    key: 'plan',
    label: 'Plan',
    type: 'select',
    options: [
      { label: 'Monthly', value: 'MONTHLY' },
      { label: 'Quarterly', value: 'QUARTERLY' },
      { label: 'Annual', value: 'ANNUAL' },
    ],
  },
];

export function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({
    status: '',
    plan: '',
  });
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', filters, page],
    queryFn: () => listSubscriptions({ ...filters, page, limit }),
  });

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ status: '', plan: '' });
    setPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'CANCELED':
        return 'secondary';
      case 'PAST_DUE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPlanDisplay = (plan: string) => {
    switch (plan) {
      case 'MONTHLY':
        return 'Monthly';
      case 'QUARTERLY':
        return 'Quarterly';
      case 'ANNUAL':
        return 'Annual';
      default:
        return plan;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage and monitor all subscription accounts
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats?.active || 0}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Currently active plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.stats?.mrr?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              MRR (normalized)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats?.churnRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            filters={filterConfigs}
            values={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            actions={
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({data?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 text-sm dark:border-neutral-800">
                    <th className="pb-3 text-left font-medium">User</th>
                    <th className="pb-3 text-left font-medium">Plan</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Period</th>
                    <th className="pb-3 text-left font-medium">Auto-Renew</th>
                    <th className="pb-3 text-left font-medium">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((sub: Subscription) => (
                    <tr
                      key={sub.id}
                      className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
                    >
                      <td className="py-4">
                        <div>
                          <div className="font-medium">
                            {sub.user.name || 'No name'}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {sub.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">{getPlanDisplay(sub.plan)}</Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={getStatusBadgeVariant(sub.status)}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm">
                        <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(sub.currentPeriodStart).toLocaleDateString()} -{' '}
                          {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4">
                        {sub.cancelAtPeriodEnd ? (
                          <Badge variant="destructive">Will Cancel</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </td>
                      <td className="py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-500">
              No subscriptions found
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

