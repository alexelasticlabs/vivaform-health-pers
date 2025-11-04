import { Plus, Coffee, Apple, Utensils, Cookie } from 'lucide-react';
import { MEAL_TYPES } from '@vivaform/shared';

interface QuickAddWidgetProps {
  onMealTypeSelect: (mealType: string) => void;
}

const MEAL_ICONS = {
  Breakfast: Coffee,
  Snack: Apple,
  Lunch: Utensils,
  Dinner: Cookie,
};

export function QuickAddWidget({ onMealTypeSelect }: QuickAddWidgetProps) {
  const handleMealSelect = (mealType: string) => {
    if (window.gtag) {
      window.gtag('event', 'meal_quick_add_click', {
        meal_type: mealType,
        from: 'quick_add_widget'
      });
    }
    onMealTypeSelect(mealType);
  };

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quick Add</h2>
        <Plus size={20} className="text-muted-foreground" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Log a meal in seconds</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {MEAL_TYPES.map((mealType) => {
          const Icon = MEAL_ICONS[mealType] || Utensils;
          
          return (
            <button
              key={mealType}
              onClick={() => handleMealSelect(mealType)}
              className="group flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-background p-4 transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 transition group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900">
                <Icon size={24} className="text-muted-foreground transition group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold">{mealType}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl bg-muted/20 p-3">
        <p className="text-xs text-muted-foreground text-center">
          Click a meal type to open quick add form
        </p>
      </div>
    </div>
  );
}
