import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, CreditCard, DollarSign, Activity, Calendar, AlertCircle } from 'lucide-react';
import { getOverviewKpis, getRevenueTrend, getNewUsers, getSubsDistribution, getActivityHeatmap, getSystemHealth } from '@/api/admin-overview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({ title, value, change, icon, loading }: { title: string; value: string | number; change?: number; icon: React.ReactNode; loading?: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</CardTitle>
        <div className="text-neutral-600 dark:text-neutral-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-600" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-600" />}
            <span className={isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-neutral-600'}>
              {change > 0 ? '+' : ''}{change}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminOverviewPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['admin', 'overview', 'kpis'],
    queryFn: getOverviewKpis,
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: revenueTrend, isLoading: revenueTrendLoading } = useQuery({
    queryKey: ['admin', 'overview', 'revenue'],
    queryFn: getRevenueTrend,
  });

  const { data: newUsers, isLoading: newUsersLoading } = useQuery({
    queryKey: ['admin', 'overview', 'newUsers'],
    queryFn: getNewUsers,
  });

  const { data: subsDistribution, isLoading: subsDistributionLoading } = useQuery({
    queryKey: ['admin', 'overview', 'subsDistribution'],
    queryFn: getSubsDistribution,
  });

  const { data: systemHealth, isLoading: systemHealthLoading } = useQuery({
    queryKey: ['admin', 'overview', 'systemHealth'],
    queryFn: getSystemHealth,
    refetchInterval: 10000, // Check every 10s
  });

  const hasSystemIssues = systemHealth && Object.values(systemHealth).some((status: any) => status !== 'healthy' && status !== 'connected');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Real-time system metrics and key performance indicators
        </p>
      </div>

      {/* System Health Alert */}
      {hasSystemIssues && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System health check detected issues. Check the System Health section below.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={kpis?.totalUsers.toLocaleString() || '—'}
          change={kpis?.totalUsersChange}
          icon={<Users className="h-4 w-4" />}
          loading={kpisLoading}
        />
        <StatCard
          title="Active Subscriptions"
          value={kpis?.activeSubs.toLocaleString() || '—'}
          change={kpis?.activeSubsChange}
          icon={<CreditCard className="h-4 w-4" />}
          loading={kpisLoading}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={kpis ? `$${kpis.mrr.toLocaleString()}` : '—'}
          change={kpis?.mrrChange}
          icon={<DollarSign className="h-4 w-4" />}
          loading={kpisLoading}
        />
        <StatCard
          title="Daily Active Users"
          value={kpis?.dau.toLocaleString() || '—'}
          change={kpis?.dauChange}
          icon={<Activity className="h-4 w-4" />}
          loading={kpisLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTrendLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : revenueTrend && revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="ma7" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="7-day MA" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-neutral-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* New Users */}
        <Card>
          <CardHeader>
            <CardTitle>New Users (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {newUsersLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : newUsers && newUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={newUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-neutral-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {subsDistributionLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : subsDistribution && subsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subsDistribution}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.plan}: ${entry.count}`}
                  >
                    {subsDistribution.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-neutral-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            {systemHealthLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : systemHealth ? (
              <div className="space-y-3">
                <HealthItem label="Database" status={systemHealth.database} />
                <HealthItem label="Redis Cache" status={systemHealth.redis} />
                <HealthItem label="Email Service" status={systemHealth.email} />
                <HealthItem label="Stripe API" status={systemHealth.stripe} />
              </div>
            ) : (
              <div className="text-neutral-500">Unable to fetch system health</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  const isHealthy = status === 'healthy' || status === 'connected' || status === 'ok';
  const isWarning = status === 'degraded' || status === 'slow';

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-600 dark:text-neutral-400">{status}</span>
        <div
          className={`h-3 w-3 rounded-full ${
            isHealthy ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
}

