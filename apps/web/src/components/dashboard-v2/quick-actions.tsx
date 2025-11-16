/**
 * Quick Actions Component
 * Fast access buttons for common dashboard actions
 */

import React, { useState } from 'react';
import { Plus, Droplet, Scale, Utensils, Activity } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsProps {
  onAddWater: (amount: number) => void;
  onAddMeal: () => void;
  onAddWeight: () => void;
  onAddActivity: () => void;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddWater,
  onAddMeal,
  onAddWeight,
  onAddActivity,
  className,
}) => {
  const [waterAmount, setWaterAmount] = useState(250);

  const actions: QuickAction[] = [
    {
      id: 'water',
      label: 'Water',
      icon: <Droplet className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
      onClick: () => onAddWater(waterAmount),
      shortcut: 'W',
    },
    {
      id: 'meal',
      label: 'Meal',
      icon: <Utensils className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
      onClick: onAddMeal,
      shortcut: 'M',
    },
    {
      id: 'weight',
      label: 'Weight',
      icon: <Scale className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50',
      onClick: onAddWeight,
      shortcut: 'G',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50',
      onClick: onAddActivity,
      shortcut: 'A',
    },
  ];

  // Water quick add amounts
  const waterQuickAmounts = [250, 500, 750, 1000];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main quick action buttons */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'group relative flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-800',
              action.bgColor
            )}
          >
            {/* Icon */}
            <div className={cn('rounded-full p-2', action.color)}>{action.icon}</div>

            {/* Label */}
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{action.label}</span>

            {/* Keyboard shortcut hint */}
            {action.shortcut && (
              <div className="absolute right-2 top-2 rounded bg-slate-900/10 px-1.5 py-0.5 text-xs font-mono text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/10 dark:text-slate-400">
                {action.shortcut}
              </div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {/* Water quick amounts (expandable) */}
      <details className="group/water">
        <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900">
          <span className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-blue-600" />
            Quick Water Amounts
          </span>
          <Plus className="h-4 w-4 transition-transform group-open/water:rotate-45" />
        </summary>

        <div className="mt-2 grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          {waterQuickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => {
                setWaterAmount(amount);
                onAddWater(amount);
              }}
              className={cn(
                'font-semibold',
                waterAmount === amount && 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30'
              )}
            >
              {amount}ml
            </Button>
          ))}
        </div>
      </details>
    </div>
  );
};
