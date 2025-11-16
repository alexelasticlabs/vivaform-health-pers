/**
 * Health Score Ring Component
 * Beautiful circular progress indicator for overall health score
 */

import React from 'react';
import { cn } from '@/lib/dashboard-utils';
import { getMotivationalMessage } from '@/lib/dashboard-utils';
import type { HealthScore } from '@/types/dashboard.types';

interface HealthScoreRingProps {
  healthScore: HealthScore;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  className?: string;
}

export const HealthScoreRing: React.FC<HealthScoreRingProps> = ({
  healthScore,
  size = 'md',
  showBreakdown = true,
  className,
}) => {
  const { overall, breakdown, trend } = healthScore;

  const sizeMap = {
    sm: { ring: 120, stroke: 8, fontSize: 'text-2xl' },
    md: { ring: 160, stroke: 10, fontSize: 'text-3xl' },
    lg: { ring: 200, stroke: 12, fontSize: 'text-4xl' },
  };

  const { ring: ringSize, stroke: strokeWidth, fontSize } = sizeMap[size];
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall / 100) * circumference;

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-green-500 to-emerald-400';
    if (score >= 70) return 'from-teal-500 to-cyan-400';
    if (score >= 60) return 'from-amber-500 to-orange-400';
    return 'from-red-400 to-orange-400';
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➖';
  };

  const getTrendColor = () => {
    if (trend === 'improving') return 'text-emerald-600';
    if (trend === 'declining') return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* SVG Ring */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        {/* Background circle */}
        <svg className="absolute inset-0 -rotate-90 transform" width={ringSize} height={ringSize}>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-800"
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id="healthScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={cn('stop-color-current', getScoreColor(overall))} />
              <stop offset="100%" className={cn('stop-color-current', getScoreColor(overall))} />
            </linearGradient>
          </defs>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="url(#healthScoreGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              stroke: `hsl(var(--${overall >= 80 ? 'emerald' : overall >= 60 ? 'amber' : 'red'}-500))`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('font-bold text-slate-900 dark:text-white', fontSize)}>{overall}</div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Health Score</div>
          <div className={cn('mt-1 text-xs font-semibold', getTrendColor())}>
            <span>{getTrendIcon()}</span> {trend}
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <p className="max-w-xs text-center text-sm text-slate-600 dark:text-slate-400">
        {getMotivationalMessage(overall)}
      </p>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          {Object.entries(breakdown).map(([key, value]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="mb-1 text-xs font-medium capitalize text-slate-600 dark:text-slate-400">{key}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{value}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
