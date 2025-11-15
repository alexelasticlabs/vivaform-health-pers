import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';
import { OptionPill } from '@/components/quiz';

export function AgeGenderStep() {
  const { answers, updateAnswers } = useQuizStore();

  return (
    <QuizCard
      title="Basic demographics"
      subtitle="We use these to calculate calorie targets and BMR"
      helpText="This helps personalize your plan to your physiology"
      emoji="🧬"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Age</label>
          <Input
            type="number"
            min={12}
            max={100}
            placeholder="e.g., 29"
            value={answers.demographics?.age ?? ''}
            onChange={(e) => updateAnswers({ demographics: { age: Number(e.target.value) || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Gender</label>
          <div className="flex flex-wrap gap-2">
            {(['male','female','other'] as const).map((g) => (
              <OptionPill
                key={g}
                selected={answers.demographics?.gender === g}
                onClick={() => updateAnswers({ demographics: { gender: g } })}
                aria-label={`Choose ${g}`}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </OptionPill>
            ))}
          </div>
        </div>
      </div>
    </QuizCard>
  );
}

