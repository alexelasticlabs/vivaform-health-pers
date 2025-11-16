import { QuizCard, OptionPill } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

const PRESETS = [1, 3, 6, 9, 12, 18, 24];

export function TimelineStep() {
  const { answers, updateAnswers } = useQuizStore();
  const months = answers.goals?.etaMonths;

  return (
    <QuizCard
      title="When would you like to reach your goal?"
      subtitle="Be realistic — sustainable progress wins"
      helpText="Pick a preset or enter a number"
      emoji="⏳"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((m) => (
          <OptionPill
            key={m}
            selected={months === m}
            onClick={() => updateAnswers({ goals: { ...(answers.goals ?? {}), etaMonths: m } })}
          >
            {m} mo
          </OptionPill>
        ))}
      </div>
      <div>
        <input
          type="number"
          min={1}
          max={24}
          placeholder="e.g., 5"
          value={months ?? ''}
          onChange={(e) => updateAnswers({ goals: { ...(answers.goals ?? {}), etaMonths: Number(e.target.value) || undefined } })}
          className="w-40 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <span className="ml-2 text-sm text-neutral-600">months</span>
      </div>
    </QuizCard>
  );
}

