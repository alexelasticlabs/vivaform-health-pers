import { useMemo } from 'react';
import { QuizCard } from '@/components/quiz';
import { useQuizStore, calculateBMI } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';

export function BodyMetricsExtendedStep() {
  const { answers, updateAnswers } = useQuizStore();

  const bmi = useMemo(() => calculateBMI(answers), [answers]);
  const waist = answers.body?.waist ?? 0;
  const hips = answers.body?.hips ?? 0;
  const whr = waist > 0 && hips > 0 ? (waist / hips).toFixed(2) : null;

  return (
    <QuizCard
      title="Tell us about your body measurements"
      subtitle="This helps us calculate BMI and personalize your plan"
      helpText="Provide the measurements you know. You can edit them later."
      emoji="📏"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Height (cm) */}
        <div>
          <label className="text-sm font-medium mb-1 block">Height (cm)</label>
          <Input
            type="number"
            min={80}
            max={250}
            placeholder="e.g., 172"
            value={answers.body?.height?.cm ?? ''}
            onChange={(e) =>
              updateAnswers({ body: { height: { cm: Number(e.target.value) || undefined } } })
            }
          />
        </div>

        {/* Weight (kg) */}
        <div>
          <label className="text-sm font-medium mb-1 block">Weight (kg)</label>
          <Input
            type="number"
            min={30}
            max={300}
            placeholder="e.g., 70"
            value={answers.body?.weight?.kg ?? ''}
            onChange={(e) =>
              updateAnswers({ body: { weight: { kg: Number(e.target.value) || undefined } } })
            }
          />
        </div>

        {/* Waist (cm) */}
        <div>
          <label className="text-sm font-medium mb-1 block">Waist (cm)</label>
          <Input
            type="number"
            min={40}
            max={200}
            placeholder="e.g., 80"
            value={answers.body?.waist ?? ''}
            onChange={(e) => updateAnswers({ body: { waist: Number(e.target.value) || undefined } })}
          />
        </div>

        {/* Hips (cm) */}
        <div>
          <label className="text-sm font-medium mb-1 block">Hips (cm)</label>
          <Input
            type="number"
            min={40}
            max={200}
            placeholder="e.g., 95"
            value={answers.body?.hips ?? ''}
            onChange={(e) => updateAnswers({ body: { hips: Number(e.target.value) || undefined } })}
          />
        </div>

        {/* Clothing size (optional) */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1 block">Clothing size (optional)</label>
          <Input
            placeholder="e.g., M / 48 / 10"
            value={answers.body?.clothingSize ?? ''}
            onChange={(e) => updateAnswers({ body: { clothingSize: e.target.value || undefined } })}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">BMI</p>
          <p className="text-2xl font-semibold">{bmi?.bmi ?? '—'}</p>
          <p className="text-xs text-neutral-500">{bmi?.category ?? '—'}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Waist-Hip Ratio</p>
          <p className="text-2xl font-semibold">{whr ?? '—'}</p>
          <p className="text-xs text-neutral-500">Lower is generally better</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Targets</p>
          <p className="text-xs text-neutral-500">We’ll calculate healthy targets based on your goal</p>
        </div>
      </div>
    </QuizCard>
  );
}

