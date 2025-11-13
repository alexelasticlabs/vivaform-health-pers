import { QuizCard, OptionTile } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { BUDGET_RANGES } from './enhanced-quiz-constants';
import { Input } from '@/components/ui/input';

export function BudgetStep() {
  const { answers, updateAnswers } = useQuizStore();
  const budget = answers.budget ?? {};

  const setRange = (id: string) => updateAnswers({ budget: { ...budget, range: id } });

  return (
    <QuizCard
      title="What’s your weekly food budget?"
      subtitle="We’ll suggest meal plans that fit your budget"
      helpText="Pick a range or enter a number"
      emoji="💸"
    >
      <div className="space-y-3">
        {BUDGET_RANGES.map((b) => (
          <OptionTile
            key={b.id}
            title={`${b.emoji} ${b.label}`}
            description={b.range}
            selected={budget.range === b.id}
            onClick={() => setRange(b.id)}
          />
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium mb-1 block">Or enter exact weekly budget ($)</label>
        <Input
          type="number"
          min={10}
          max={10000}
          placeholder="e.g., 60"
          value={budget.weeklyBudget ?? ''}
          onChange={(e) => updateAnswers({ budget: { ...budget, weeklyBudget: Number(e.target.value) || undefined } })}
        />
      </div>
    </QuizCard>
  );
}

