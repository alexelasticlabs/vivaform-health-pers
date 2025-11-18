import { QuizCard, OptionPill } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { SLEEP_QUALITY } from './enhanced-quiz-constants';
import { Input } from '@/components/ui/input';

export function SleepPatternStep() {
  const { answers, updateAnswers } = useQuizStore();
  const sleep = (answers.sleep as any) ?? {};

  return (
    <QuizCard
      title="Tell us about your sleep"
      subtitle="Sleep patterns affect metabolism and energy"
      helpText="Provide what you know — this helps tailor recommendations"
      emoji="😴"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Bedtime</label>
          <Input
            placeholder="23:00"
            value={sleep.bedtime ?? ''}
            onChange={(e) => updateAnswers({ sleep: { ...sleep, bedtime: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Wake time</label>
          <Input
            placeholder="07:00"
            value={sleep.waketime ?? ''}
            onChange={(e) => updateAnswers({ sleep: { ...sleep, waketime: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Hours per night</label>
          <Input
            type="number"
            min={2}
            max={14}
            placeholder="e.g., 7.5"
            value={sleep.hoursPerNight ?? ''}
            onChange={(e) => updateAnswers({ sleep: { ...sleep, hoursPerNight: Number(e.target.value) || undefined } })}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium mb-2 block">Sleep quality</label>
        <div className="flex flex-wrap gap-2">
          {SLEEP_QUALITY.map((q) => (
            <OptionPill
              key={q.value}
              selected={sleep.quality === q.value}
              onClick={() => updateAnswers({ sleep: { ...sleep, quality: q.value } })}
              aria-label={`Choose ${q.label}`}
            >
              {q.emoji} {q.label}
            </OptionPill>
          ))}
        </div>
      </div>
    </QuizCard>
  );
}

