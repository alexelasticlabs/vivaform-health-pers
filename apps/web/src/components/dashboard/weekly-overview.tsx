import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

interface WeeklyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface WeeklyOverviewProps {
  data: WeeklyData[];
  goal: number;
}

type MetricType = 'calories' | 'protein' | 'fat' | 'carbs';

export function WeeklyOverview({ data, goal }: WeeklyOverviewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('calories');

  // Analytics: Track widget view
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'dashboard_widget_view', {
        widget_name: 'weekly_overview',
        days_count: data.length
      });
    }
  }, [data.length]);

  // Analytics: Track metric switch
  const handleMetricSwitch = (metric: MetricType) => {
    if (window.gtag) {
      window.gtag('event', 'weekly_tab_switch', {
        metric,
        previous_metric: selectedMetric
      });
    }
    setSelectedMetric(metric);
  };

  const metrics: { key: MetricType; label: string; color: string }[] = [
    { key: 'calories', label: 'Calories', color: 'bg-emerald-500' },
    { key: 'protein', label: 'Protein', color: 'bg-blue-500' },
    { key: 'fat', label: 'Fat', color: 'bg-amber-500' },
    { key: 'carbs', label: 'Carbs', color: 'bg-purple-500' },
  ];

  // Calculate stats
  const values = data.map(d => d[selectedMetric]);
  const maxValue = Math.max(...values, goal);
  const daysWithinTarget = values.filter(v => selectedMetric === 'calories' ? v <= goal * 1.1 : true).length;

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Weekly Overview</h2>
          <p className="text-xs text-muted-foreground">
            Last 7 days • {daysWithinTarget}/7 days within target 👏
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => handleMetricSwitch(metric.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                selectedMetric === metric.key
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-48 w-full">
        <div className="flex h-full items-end justify-between gap-2">
          {data.map((day, index) => {
            const value = day[selectedMetric];
            const height = (value / maxValue) * 100;
            const isAboveGoal = selectedMetric === 'calories' && value > goal;
            const currentMetric = metrics.find(m => m.key === selectedMetric);

            return (
              <div key={day.date} className="group relative flex flex-1 flex-col items-center">
                {/* Tooltip */}
                <div className="invisible absolute bottom-full mb-2 min-w-max rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition group-hover:visible group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                  <p className="font-semibold">{value.toFixed(0)} {selectedMetric === 'calories' ? 'kcal' : 'g'}</p>
                  <p className="text-gray-300 dark:text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Bar */}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isAboveGoal ? 'bg-red-500' : currentMetric?.color
                    } ${height < 5 ? 'min-h-[4px]' : ''}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>

                {/* Day Label */}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })[0]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Line Reference */}
      {selectedMetric === 'calories' && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/40 p-3">
          <div className="h-0.5 w-8 bg-gray-400" />
          <p className="text-xs text-muted-foreground">
            Goal: {goal} kcal/day
          </p>
        </div>
      )}

      {/* Insight */}
      <div className="mt-4 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3">
          <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            You stayed within target <strong>{daysWithinTarget}/7 days</strong> this week.
            {daysWithinTarget >= 5 ? ' Great consistency! 🎉' : ' Keep tracking to improve!'}
          </p>
        </div>
      </div>
    </div>
  );
}
