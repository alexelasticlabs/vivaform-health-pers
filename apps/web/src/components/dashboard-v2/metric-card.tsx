/**
 * Metric Card Component
 * Beautiful, responsive card for displaying dashboard metrics
 */

import React from 'react';
import { cn } from '@/lib/dashboard-utils';
import { formatMetricValue, calculateProgress, getProgressColor } from '@/lib/dashboard-utils';
import type { DashboardMetric } from '@/types/dashboard.types';

interface MetricCardProps {
  metric: DashboardMetric;
  onClick?: () => void;
  className?: string;
  showProgress?: boolean;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  onClick,
  className,
  showProgress = true,
  showTrend = true,
  size = 'md',
}) => {
  const progress = metric.target ? calculateProgress(metric.value, metric.target) : 100;
  const progressColor = getProgressColor(progress);

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const titleSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const valueSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        sizeClasses[size],
        className
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10',
          metric.color || 'bg-gradient-to-br from-emerald-500 to-teal-500'
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and label */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {metric.icon && <span className="text-lg">{metric.icon}</span>}
            <span className={cn('font-medium text-slate-600 dark:text-slate-400', titleSize[size])}>
              {metric.label}
            </span>
          </div>

          {/* Trend indicator */}
          {showTrend && metric.trend && metric.changePercent !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                metric.trend === 'up' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30',
                metric.trend === 'down' && 'bg-red-50 text-red-600 dark:bg-red-950/30',
                metric.trend === 'stable' && 'bg-slate-50 text-slate-600 dark:bg-slate-950/30'
              )}
            >
              {metric.trend === 'up' && '↗'}
              {metric.trend === 'down' && '↘'}
              {metric.trend === 'stable' && '→'}
              <span>{Math.abs(metric.changePercent)}%</span>
            </div>
          )}
        </div>

        {/* Value display */}
        <div className="mb-3">
          <div className={cn('font-bold text-slate-900 dark:text-white', valueSize[size])}>
            {formatMetricValue(metric.value, metric.unit)}
            {metric.target && (
              <span className="ml-2 text-base font-normal text-slate-400">
                / {formatMetricValue(metric.target, metric.unit)}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && metric.target && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress >= 90 && 'bg-gradient-to-r from-emerald-500 to-green-500',
                  progress >= 70 && progress < 90 && 'bg-gradient-to-r from-green-500 to-emerald-400',
                  progress >= 50 && progress < 70 && 'bg-gradient-to-r from-amber-500 to-orange-400',
                  progress < 50 && 'bg-gradient-to-r from-red-400 to-orange-400'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{progress}% complete</span>
              {metric.target && progress < 100 && (
                <span>{formatMetricValue(metric.target - metric.value, metric.unit)} to go</span>
              )}
              {progress >= 100 && <span className="font-semibold text-emerald-600">Goal reached! 🎉</span>}
            </div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      {onClick && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      )}
    </div>
  );
};
