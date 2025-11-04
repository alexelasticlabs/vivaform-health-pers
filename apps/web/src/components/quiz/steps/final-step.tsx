import { useMemo } from 'react';
import { useQuizStore, calculateBMI } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';

export function FinalStep() {
  const { answers } = useQuizStore();
  const bmi = calculateBMI(answers);

  const kcalRange = useMemo(() => {
    if (!bmi) return null;
    // Very rough estimate for preview only
    // Base 24 * weight, adjust by activity if present
    const weight = answers.body?.weight?.kg ?? 70;
    let base = weight * 24;
    const activity = answers.habits?.activityLevel;
    const factor = activity === 'sedentary' ? 1.2 : activity === 'light' ? 1.375 : activity === 'moderate' ? 1.55 : activity === 'active' ? 1.725 : 1.2;
    const kcal = Math.round(base * factor);
    return { kcal, protein: Math.round(weight * 1.6), fat: Math.round(weight * 0.8), carbs: Math.round((kcal - (weight * 1.6 * 4) - (weight * 0.8 * 9)) / 4) };
  }, [answers, bmi]);

  return (
    <QuizCard
      title="Your Personalized Plan Preview"
      subtitle="Here’s a quick preview based on your inputs"
      helpText="You’ll see full details after account creation — this is just a teaser."
      emoji="✨"
    >
      <div className="space-y-6">
        {bmi && (
          <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-emerald-900/40 dark:bg-neutral-900/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <p className="text-2xl font-bold text-emerald-600">{bmi.bmi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold">{bmi.category}</p>
              </div>
            </div>
          </div>
        )}

        {kcalRange && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-xs text-muted-foreground">Daily kcal</div>
              <div className="text-xl font-semibold">{kcalRange.kcal}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-xs text-muted-foreground">Protein (g)</div>
              <div className="text-xl font-semibold">{kcalRange.protein}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-xs text-muted-foreground">Fat (g)</div>
              <div className="text-xl font-semibold">{kcalRange.fat}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-xs text-muted-foreground">Carbs (g)</div>
              <div className="text-xl font-semibold">{isFinite(kcalRange.carbs) ? kcalRange.carbs : 0}</div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-2 text-base font-semibold">What you’ll get</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>3 personalized meal templates matching your preferences</li>
            <li>Smart grocery list and easy swaps</li>
            <li>Weekly progress tracking and reminders</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          Create a free account to see your full plan and save progress.
        </div>
      </div>
    </QuizCard>
  );
}
