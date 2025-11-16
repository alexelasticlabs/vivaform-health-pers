import { type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'from last month',
  icon,
  trend,
  loading,
  className = ''
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {title}
          </CardTitle>
          {icon && <div className="text-neutral-600 dark:text-neutral-400">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          {change !== undefined && (
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          )}
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const trendColor = trend === 'up' || isPositive
    ? 'text-green-600'
    : trend === 'down' || isNegative
    ? 'text-red-600'
    : 'text-neutral-600';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {title}
        </CardTitle>
        {icon && <div className="text-neutral-600 dark:text-neutral-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-600" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-600" />}
            <span className={trendColor}>
              {change > 0 ? '+' : ''}{change}% {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

