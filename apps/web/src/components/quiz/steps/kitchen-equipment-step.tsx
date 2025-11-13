import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { KITCHEN_EQUIPMENT } from './enhanced-quiz-constants';
import { Checkbox } from '@/components/ui/checkbox';

export function KitchenEquipmentStep() {
  const { answers, updateAnswers } = useQuizStore();
  const selected = answers.cooking?.equipment ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    updateAnswers({ cooking: { ...answers.cooking, equipment: next } });
  };

  return (
    <QuizCard
      title="What kitchen equipment do you have?"
      subtitle="We’ll suggest recipes that fit your tools"
      helpText="Pick everything that applies"
      emoji="🍳"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {KITCHEN_EQUIPMENT.map((eq) => (
          <label
            key={eq.id}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
              selected.includes(eq.id)
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <Checkbox checked={selected.includes(eq.id)} onCheckedChange={() => toggle(eq.id)} />
            <span className="text-xl">{eq.icon}</span>
            <span className="text-sm font-medium">{eq.label}</span>
          </label>
        ))}
      </div>
    </QuizCard>
  );
}

