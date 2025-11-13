import { QuizCard, OptionPill } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { SOCIAL_EATING } from './enhanced-quiz-constants';
import { Input } from '@/components/ui/input';

export function SocialEatingStep() {
  const { answers, updateAnswers } = useQuizStore();
  const social = answers.socialEating ?? {};

  return (
    <QuizCard
      title="How often do you eat out or socially?"
      subtitle="We’ll adapt to real-life social patterns"
      helpText="Pick frequency and add typical occasions"
      emoji="🍻"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Frequency</label>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_EATING.map((s) => (
              <OptionPill
                key={s.frequency}
                selected={social.frequency === s.frequency}
                onClick={() => updateAnswers({ socialEating: { ...social, frequency: s.frequency } })}
                aria-label={`Choose ${s.label}`}
              >
                {s.emoji} {s.label}
              </OptionPill>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Occasions (comma-separated)</label>
          <Input
            placeholder="e.g., Work lunches, Family dinners"
            value={(social.occasions ?? []).join(', ')}
            onChange={(e) => updateAnswers({ socialEating: { ...social, occasions: e.target.value ? e.target.value.split(',').map(x => x.trim()) : undefined } })}
          />
        </div>
      </div>
    </QuizCard>
  );
}

