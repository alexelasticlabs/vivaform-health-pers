import { Plus, Droplet } from 'lucide-react';

interface WaterWidgetProps {
  consumed: number;
  goal: number;
  onAddWater: (amount: number) => void;
}

export function WaterWidget({ consumed, goal, onAddWater }: WaterWidgetProps) {
  const percentage = Math.min(100, (consumed / goal) * 100);
  const remaining = Math.max(0, goal - consumed);
  const glassCount = 8;
  const filledGlasses = Math.floor((consumed / goal) * glassCount);

  const handleAddWater = (amount: number) => {
    if (window.gtag) {
      window.gtag('event', 'water_add_click', { amount_ml: amount });
    }
    onAddWater(amount);
  };

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Water Tracker</h2>
        <Droplet size={20} className="text-blue-500" />
      </div>

      {/* Water Counter */}
      <div className="mt-6 text-center">
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {consumed.toLocaleString()}
          <span className="text-xl text-muted-foreground"> / {goal.toLocaleString()} ml</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {remaining > 0 ? `${remaining} ml to go` : 'Goal reached! 🎉'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Glass Icons */}
      <div className="mt-5 flex justify-center gap-2">
        {Array.from({ length: glassCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleAddWater(250)}
            className="group flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
            title="Add 250 ml"
          >
            <Droplet
              size={20}
              className={`transition ${
                i < filledGlasses
                  ? 'fill-blue-500 text-blue-500'
                  : 'text-gray-300 group-hover:text-blue-400 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Quick Add Button */}
      <button
        onClick={() => handleAddWater(250)}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        <Plus size={16} />
        Add 250 ml
      </button>

      {consumed === 0 && (
        <div className="mt-4 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Hydration helps your energy — add your first glass 💧
          </p>
        </div>
      )}
    </div>
  );
}
