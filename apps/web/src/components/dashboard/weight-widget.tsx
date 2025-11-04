import { Plus, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import type { WeightEntry } from '@vivaform/shared';

interface WeightWidgetProps {
  latest: WeightEntry | null;
  history: WeightEntry[];
  heightCm?: number;
  onAddWeight: () => void;
}

export function WeightWidget({ latest, history, heightCm, onAddWeight }: WeightWidgetProps) {
  // Calculate BMI
  const bmi = latest && heightCm ? latest.weightKg / Math.pow(heightCm / 100, 2) : null;
  
  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-950' };
    if (bmiValue < 25) return { label: 'Normal 👌', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-950' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-950' };
    return { label: 'Obese', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-950' };
  };

  const bmiCategory = bmi ? getBmiCategory(bmi) : null;

  // Calculate trend (last 14 days)
  const recentHistory = history.slice(-14);
  const trend = recentHistory.length >= 2
    ? recentHistory[recentHistory.length - 1].weightKg - recentHistory[0].weightKg
    : 0;

  // Analytics: Track widget view
  const recentHistoryLength = recentHistory.length;
  const bmiCategoryLabel = bmiCategory?.label || 'unknown';

  useEffect(() => {
    if (window.gtag && latest) {
      window.gtag('event', 'dashboard_widget_view', {
        widget_name: 'weight',
        has_bmi: !!bmi,
        has_trend: recentHistoryLength >= 2,
        bmi_category: bmiCategoryLabel
      });
    }
  }, [latest, bmi, recentHistoryLength, bmiCategoryLabel]);

  const handleAddWeight = () => {
    if (window.gtag) {
      window.gtag('event', 'weight_add_click', {
        from: 'weight_widget',
        current_bmi: bmi?.toFixed(1)
      });
    }
    onAddWeight();
  };

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weight & BMI</h2>
        <button
          onClick={handleAddWeight}
          className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-600"
        >
          <Plus size={14} />
          Add weight
        </button>
      </div>

      {latest ? (
        <>
          {/* Current Weight */}
          <div className="mt-6">
            <div className="flex items-baseline gap-2">
              <Scale size={20} className="text-purple-500" />
              <p className="text-4xl font-bold">{latest.weightKg}</p>
              <span className="text-lg text-muted-foreground">kg</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Last updated {new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* BMI Card */}
          {bmi && bmiCategory && (
            <div className={`mt-4 rounded-xl ${bmiCategory.bgColor} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">BMI</p>
                  <p className={`text-2xl font-bold ${bmiCategory.color}`}>
                    {bmi.toFixed(1)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trend */}
          {trend !== 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/40 p-3">
              {trend > 0 ? (
                <>
                  <TrendingUp size={16} className="text-red-500" />
                  <p className="text-sm">
                    <span className="font-semibold text-red-600 dark:text-red-400">+{Math.abs(trend).toFixed(1)} kg</span>
                    <span className="text-muted-foreground"> over 14 days</span>
                  </p>
                </>
              ) : (
                <>
                  <TrendingDown size={16} className="text-green-500" />
                  <p className="text-sm">
                    <span className="font-semibold text-green-600 dark:text-green-400">-{Math.abs(trend).toFixed(1)} kg</span>
                    <span className="text-muted-foreground"> over 14 days</span>
                  </p>
                </>
              )}
            </div>
          )}

          {/* Mini Sparkline */}
          {recentHistory.length > 1 && (
            <div className="mt-4 h-16 rounded-xl bg-muted/20 p-2">
              <svg className="h-full w-full" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-purple-500"
                  points={recentHistory.map((entry, i) => {
                    const x = (i / (recentHistory.length - 1)) * 100;
                    const minWeight = Math.min(...recentHistory.map(e => e.weightKg));
                    const maxWeight = Math.max(...recentHistory.map(e => e.weightKg));
                    const y = 100 - ((entry.weightKg - minWeight) / (maxWeight - minWeight || 1)) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </svg>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-xl bg-muted/20 p-6 text-center">
          <Scale size={32} className="mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Log your weight to see your progress over time 📈
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Best time: morning before breakfast
          </p>
        </div>
      )}
    </div>
  );
}
