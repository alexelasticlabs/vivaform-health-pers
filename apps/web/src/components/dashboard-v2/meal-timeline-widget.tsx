/**
 * Meal Timeline Widget
 * Displays daily meal breakdown with nutrition info
 */

import React from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import type { MealTimelineEntry } from '@/types/dashboard.types';

interface MealTimelineWidgetProps {
  date: string;
  meals: MealTimelineEntry[];
  onAddMeal?: (type: MealTimelineEntry['type']) => void;
  className?: string;
}

const MealTimelineWidget: React.FC<MealTimelineWidgetProps> = ({ date, meals, onAddMeal, className }) => {
  const mealTypes: MealTimelineEntry['type'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getMealIcon = (type: MealTimelineEntry['type']) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
    }
  };

  const getMealTime = (type: MealTimelineEntry['type']) => {
    switch (type) {
      case 'breakfast':
        return '7:00 - 10:00';
      case 'lunch':
        return '12:00 - 14:00';
      case 'dinner':
        return '18:00 - 21:00';
      case 'snack':
        return 'Anytime';
    }
  };

  const getMealEntry = (type: MealTimelineEntry['type']) => {
    return meals.find((m) => m.type === type);
  };

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Meals</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {meals.filter((m) => m.logged).length} of {mealTypes.length} logged
          </p>
        </div>

        {/* Total calories */}
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{meals.reduce((sum, m) => sum + m.calories, 0)}</div>
          <div className="text-xs text-slate-500">calories</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-blue-500" />

        {mealTypes.map((type) => {
          const entry = getMealEntry(type);
          const isLogged = entry?.logged || false;

          return (
            <div key={type} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isLogged
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                  )}
                >
                  {isLogged ? <Check className="h-5 w-5" /> : <span className="text-lg">{getMealIcon(type)}</span>}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                {isLogged && entry ? (
                  // Logged meal
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold capitalize text-slate-900 dark:text-white">{type}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {entry.time}
                      </div>
                    </div>

                    {/* Food items */}
                    {entry.items && entry.items.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {entry.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                            <span className="font-medium text-slate-600 dark:text-slate-400">{item.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-emerald-200 pt-2 dark:border-emerald-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Total</span>
                        <span className="text-lg font-bold text-emerald-600">{entry.calories} cal</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Not logged
                  <button
                    onClick={() => onAddMeal?.(type)}
                    className="group w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-semibold capitalize text-slate-700 group-hover:text-emerald-700 dark:text-slate-300 dark:group-hover:text-emerald-400">
                          {type}
                        </h4>
                        <p className="text-xs text-slate-500">{getMealTime(type)}</p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all group-hover:bg-emerald-500 group-hover:text-white dark:bg-slate-800 dark:group-hover:bg-emerald-500">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealTimelineWidget;
