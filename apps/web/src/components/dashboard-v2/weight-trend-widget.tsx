/**
 * Weight Trend Widget
 * Displays weight progress over time with trend visualization
 */

import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';

interface WeightTrendWidgetProps {
  userId: string;
  className?: string;
}

const WeightTrendWidget: React.FC<WeightTrendWidgetProps> = ({ userId, className }) => {
  // Mock data - replace with real API call
  const mockData = {
    current: 75.2,
    start: 78.0,
    target: 72.0,
    trend: 'down' as const,
    weeklyChange: -0.3,
    dataPoints: [
      { date: '2025-11-09', weight: 78.0 },
      { date: '2025-11-10', weight: 77.8 },
      { date: '2025-11-11', weight: 77.5 },
      { date: '2025-11-12', weight: 77.2 },
      { date: '2025-11-13', weight: 76.8 },
      { date: '2025-11-14', weight: 76.3 },
      { date: '2025-11-15', weight: 75.8 },
      { date: '2025-11-16', weight: 75.2 },
    ],
  };

  const { current, start, target, trend, weeklyChange, dataPoints } = mockData;
  const progress = ((start - current) / (start - target)) * 100;

  const maxWeight = Math.max(...dataPoints.map((d) => d.weight));
  const minWeight = Math.min(...dataPoints.map((d) => d.weight));
  const range = maxWeight - minWeight;

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weight Trend</h3>
        <div className="flex items-center gap-2">
          {trend === 'down' && <TrendingDown className="h-5 w-5 text-emerald-600" />}
          {trend === 'up' && <TrendingUp className="h-5 w-5 text-red-600" />}
          {trend === 'stable' && <Minus className="h-5 w-5 text-slate-600" />}
          <span
            className={cn(
              'text-sm font-semibold',
              trend === 'down' && 'text-emerald-600',
              trend === 'up' && 'text-red-600',
              trend === 'stable' && 'text-slate-600'
            )}
          >
            {weeklyChange > 0 ? '+' : ''}
            {weeklyChange.toFixed(1)}kg this week
          </span>
        </div>
      </div>

      {/* Current stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Current</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{current}kg</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Target</div>
          <div className="text-2xl font-bold text-emerald-600">{target}kg</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">To Go</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{(current - target).toFixed(1)}kg</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className="font-semibold text-emerald-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Simple chart visualization */}
      <div className="relative h-32">
        <svg className="h-full w-full" viewBox="0 0 400 128" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="0" x2="400" y2="0" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />
          <line x1="0" y1="64" x2="400" y2="64" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
          <line x1="0" y1="128" x2="400" y2="128" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />

          {/* Area gradient */}
          <defs>
            <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Data line and area */}
          {dataPoints.length > 1 && (
            <>
              {/* Area under curve */}
              <path
                d={`M ${dataPoints
                  .map((d, i) => {
                    const x = (i / (dataPoints.length - 1)) * 400;
                    const y = 128 - ((d.weight - minWeight) / range) * 128;
                    return `${x},${y}`;
                  })
                  .join(' L ')} L 400,128 L 0,128 Z`}
                fill="url(#weightGradient)"
              />

              {/* Line */}
              <polyline
                points={dataPoints
                  .map((d, i) => {
                    const x = (i / (dataPoints.length - 1)) * 400;
                    const y = 128 - ((d.weight - minWeight) / range) * 128;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="rgb(16, 185, 129)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {dataPoints.map((d, i) => {
                const x = (i / (dataPoints.length - 1)) * 400;
                const y = 128 - ((d.weight - minWeight) / range) * 128;
                return (
                  <circle
                    key={d.date}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="white"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth="2"
                    className="transition-all hover:r-6"
                  />
                );
              })}
            </>
          )}
        </svg>

        {/* Date labels */}
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{new Date(dataPoints[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>
            {new Date(dataPoints[dataPoints.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeightTrendWidget;
