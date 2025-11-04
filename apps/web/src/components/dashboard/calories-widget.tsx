import { Plus } from 'lucide-react';
import type { NutritionEntry } from '@vivaform/shared';
import { useEffect } from 'react';

interface CaloriesWidgetProps {
  consumed: number;
  goal: number;
  entries: NutritionEntry[];
  onAddMeal: () => void;
}

export function CaloriesWidget({ consumed, goal, entries, onAddMeal }: CaloriesWidgetProps) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min(100, (consumed / goal) * 100);
  const isOverTarget = consumed > goal;

  // Last 3 entries
  const recentEntries = entries.slice(-3).reverse();

  // Log impression
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'dashboard_widget_view', {
        widget_name: 'calories',
        consumed,
        goal,
        percentage: percentage.toFixed(1)
      });
    }
  }, [consumed, goal, percentage]);

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Calories Today</h2>
        <button
          onClick={() => {
            if (window.gtag) {
              window.gtag('event', 'meal_quick_add_open', { from: 'calories_widget' });
            }
            onAddMeal();
          }}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
        >
          <Plus size={14} />
          Add meal
        </button>
      </div>

      {/* Circular Progress */}
      <div className="mt-6 flex justify-center">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full -rotate-90 transform">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
              className={isOverTarget ? 'text-red-500' : 'text-emerald-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">{consumed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/ {goal.toLocaleString()} kcal</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className={`text-sm font-semibold ${isOverTarget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isOverTarget ? `${consumed - goal} kcal over` : `${remaining} kcal left`}
        </p>
      </div>

      {/* Recent Entries */}
      <div className="mt-6 space-y-2">
        {recentEntries.length > 0 ? (
          <>
            <p className="text-xs font-medium text-muted-foreground">Recent meals</p>
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.mealType}</p>
                  <p className="text-xs text-muted-foreground">{entry.food}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{entry.calories} kcal</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="rounded-xl bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">No meals yet. Add your first breakfast 🍳</p>
          </div>
        )}
      </div>
    </div>
  );
}
