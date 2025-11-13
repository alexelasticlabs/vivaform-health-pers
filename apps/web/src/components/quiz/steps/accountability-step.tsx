import { QuizCard, OptionTile } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { ACCOUNTABILITY_OPTIONS } from './enhanced-quiz-constants';
import { Checkbox } from '@/components/ui/checkbox';

export function AccountabilityStep() {
  const { answers, updateAnswers } = useQuizStore();
  const acc = answers.accountability ?? {};

  return (
    <QuizCard
      title="Would you like support along the way?"
      subtitle="Accountability can greatly boost success"
      helpText="Pick one option — you can change later"
      emoji="🤝"
    >
      <div className="space-y-3">
        {ACCOUNTABILITY_OPTIONS.map((opt) => (
          <OptionTile
            key={opt.type}
            title={opt.title}
            description={opt.description}
            selected={acc.type === opt.type}
            onClick={() => updateAnswers({ accountability: { ...acc, type: opt.type } })}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Checkbox
          checked={!!acc.referFriend}
          onCheckedChange={(v) => updateAnswers({ accountability: { ...acc, referFriend: !!v } })}
        />
        <span className="text-sm">Invite a friend to join me</span>
      </div>
    </QuizCard>
  );
}

