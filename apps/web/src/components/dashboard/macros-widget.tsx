import { useEffect } from 'react';

interface MacrosWidgetProps {
  protein: { current: number; goal: number };
  fat: { current: number; goal: number };
  carbs: { current: number; goal: number };
}

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  emoji: string;
}

function MacroBar({ label, current, goal, color, emoji }: MacroBarProps) {
  const percentage = Math.min(100, (current / goal) * 100);
  const isLow = percentage < 50;
  const isOver = current > goal * 1.2;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {emoji} {label}
        </span>
        <span className="text-sm font-semibold">
          {current}g / {goal}g
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isLow && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Low on {label.toLowerCase()} — consider adding more
        </p>
      )}
      {isOver && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Over {label.toLowerCase()} target
        </p>
      )}
    </div>
  );
}

export function MacrosWidget({ protein, fat, carbs }: MacrosWidgetProps) {
  const suggestions: string[] = [];

  if (protein.current < protein.goal * 0.5) {
    suggestions.push('Try eggs, yogurt, or chicken to boost protein 🥚');
  }
  if (carbs.current > carbs.goal * 1.2) {
    suggestions.push('High carbs today — balance with protein & veggies 🥗');
  }

  // Analytics: Track widget view
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'dashboard_widget_view', {
        widget_name: 'macros',
        protein_pct: ((protein.current / protein.goal) * 100).toFixed(1),
        fat_pct: ((fat.current / fat.goal) * 100).toFixed(1),
        carbs_pct: ((carbs.current / carbs.goal) * 100).toFixed(1)
      });
    }
  }, [protein, fat, carbs]);

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Macros Today</h2>
      <p className="text-xs text-muted-foreground">Track your protein, fat, and carbs</p>

      <div className="mt-6 space-y-5">
        <MacroBar
          label="Protein"
          current={protein.current}
          goal={protein.goal}
          emoji="💪"
          color="bg-blue-500"
        />
        <MacroBar
          label="Fat"
          current={fat.current}
          goal={fat.goal}
          emoji="🥑"
          color="bg-amber-500"
        />
        <MacroBar
          label="Carbs"
          current={carbs.current}
          goal={carbs.goal}
          emoji="🍞"
          color="bg-purple-500"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-5 space-y-2">
          {suggestions.map((suggestion, i) => (
            <div key={i} className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
              <p className="text-xs text-amber-800 dark:text-amber-200">{suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
