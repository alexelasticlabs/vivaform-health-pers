/**
 * Insights Card Component
 * Displays personalized daily insights and recommendations
 */

import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import type { DailyInsight } from '@/types/dashboard.types';

interface InsightsCardProps {
  insights: DailyInsight[];
  maxInsights?: number;
  onActionClick?: (insight: DailyInsight) => void;
  className?: string;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({
  insights,
  maxInsights = 3,
  onActionClick,
  className,
}) => {
  const displayedInsights = insights.slice(0, maxInsights);

  const getInsightIcon = (type: DailyInsight['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-5 w-5" />;
      case 'achievement':
        return <Trophy className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'milestone':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getInsightStyles = (type: DailyInsight['type']) => {
    switch (type) {
      case 'tip':
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          icon: 'text-blue-600',
          title: 'text-blue-900 dark:text-blue-200',
        };
      case 'achievement':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          icon: 'text-amber-600',
          title: 'text-amber-900 dark:text-amber-200',
        };
      case 'warning':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50 dark:bg-red-950/20',
          icon: 'text-red-600',
          title: 'text-red-900 dark:text-red-200',
        };
      case 'milestone':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          icon: 'text-emerald-600',
          title: 'text-emerald-900 dark:text-emerald-200',
        };
      default:
        return {
          border: 'border-l-slate-500',
          bg: 'bg-slate-50 dark:bg-slate-950/20',
          icon: 'text-slate-600',
          title: 'text-slate-900 dark:text-slate-200',
        };
    }
  };

  const getPriorityBadge = (priority: DailyInsight['priority']) => {
    if (priority === 'high') {
      return (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
          High Priority
        </span>
      );
    }
    return null;
  };

  if (displayedInsights.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No insights yet. Keep logging your meals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Insights</h3>
        {insights.length > maxInsights && (
          <span className="ml-auto text-xs text-slate-500">+{insights.length - maxInsights} more</span>
        )}
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {displayedInsights.map((insight) => {
          const styles = getInsightStyles(insight.type);

          return (
            <div
              key={insight.id}
              className={cn(
                'group relative overflow-hidden rounded-xl border-l-4 p-4 transition-all duration-200 hover:shadow-md',
                styles.border,
                styles.bg
              )}
            >
              {/* Content */}
              <div className="flex gap-3">
                {/* Icon */}
                <div className={cn('flex-shrink-0', styles.icon)}>{getInsightIcon(insight.type)}</div>

                {/* Text content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn('font-semibold', styles.title)}>{insight.title}</h4>
                    {getPriorityBadge(insight.priority)}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">{insight.description}</p>

                  {/* Action button */}
                  {insight.actionable && (
                    <button
                      onClick={() => onActionClick?.(insight)}
                      className={cn(
                        'mt-2 inline-flex items-center gap-1 text-sm font-semibold transition-colors',
                        styles.icon,
                        'hover:underline'
                      )}
                    >
                      {insight.actionable.label} →
                    </button>
                  )}
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>

      {/* View all link */}
      {insights.length > maxInsights && (
        <button className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900">
          View All Insights ({insights.length})
        </button>
      )}
    </div>
  );
};
