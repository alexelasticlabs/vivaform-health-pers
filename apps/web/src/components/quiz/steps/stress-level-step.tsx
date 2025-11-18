import { QuizCard, OptionPill } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { STRESS_FACTORS } from './enhanced-quiz-constants';
import { SliderInput } from '@/components/quiz';

export function StressLevelStep() {
  const { answers, updateAnswers } = useQuizStore();
  const stress = (answers.stress as any) ?? {};

  return (
    <QuizCard
      title="How stressed do you feel?"
      subtitle="Stress impacts cravings and energy"
      helpText="Pick a level and what contributes to it"
      emoji="😬"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Stress level (1–10)</label>
          <SliderInput
            min={1}
            max={10}
            step={1}
            value={stress.level ?? 5}
            onChange={(val) => updateAnswers({ stress: { ...stress, level: val } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Main stress factors</label>
          <div className="flex flex-wrap gap-2">
            {STRESS_FACTORS.map((f) => (
              <OptionPill
                key={f.id}
                selected={(stress.factors ?? []).includes(f.id)}
                onClick={() => {
                  const list = new Set(stress.factors ?? []);
                  if (list.has(f.id)) list.delete(f.id); else list.add(f.id);
                  updateAnswers({ stress: { ...stress, factors: Array.from(list) } });
                }}
              >
                {f.emoji} {f.label}
              </OptionPill>
            ))}
          </div>
        </div>
      </div>
    </QuizCard>
  );
}

