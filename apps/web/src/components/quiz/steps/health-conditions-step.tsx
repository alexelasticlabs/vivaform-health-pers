import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { HEALTH_CONDITIONS } from './enhanced-quiz-constants';
import { Checkbox } from '@/components/ui/checkbox';

export function HealthConditionsStep() {
  const { answers, updateAnswers } = useQuizStore();
  const selected = (answers.health as any)?.conditions ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x: any) => x !== id) : [...selected, id];
    updateAnswers({ health: { conditions: next } });
  };

  return (
    <QuizCard
      title="Any health conditions we should know about?"
      subtitle="We’ll tailor recommendations to be safe and effective"
      helpText="You can skip if none apply"
      emoji="🏥"
    >
      <div className="space-y-3">
        {HEALTH_CONDITIONS.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selected.includes(c.id)
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <Checkbox
              checked={selected.includes(c.id)}
              onCheckedChange={() => toggle(c.id)}
            />
            <span className="flex-1 text-sm font-medium">{c.label}</span>
            {c.requiresCareful && (
              <span className="text-xs text-amber-600">We’ll be extra careful</span>
            )}
          </label>
        ))}
      </div>
    </QuizCard>
  );
}

