import { QuizCard, OptionTile } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { logQuizOptionSelected } from '@/lib/analytics';
import { ACTIVITY_LEVELS } from '@vivaform/shared';

export function ActivityLevelStep() {
  const { answers, updateAnswers } = useQuizStore();

  const handleSelect = (level: string) => {
    updateAnswers({ habits: { activityLevel: level } });
    try { logQuizOptionSelected(useQuizStore.getState().clientId, 'activity_level', 'habits.activityLevel', level); } catch {}
  };

  return (
    <QuizCard
      title="How active are you on an average day?"
      subtitle="This helps us calculate your daily calorie needs"
      helpText="We use this to estimate your TDEE (daily energy)."
      emoji="🏃"
    >
      <div className="space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <OptionTile
            key={level.value}
            title={level.label}
            description={level.description}
            selected={answers.habits?.activityLevel === level.value}
            onClick={() => handleSelect(level.value)}
            aria-label={`Choose ${level.label}`}
          />
        ))}
      </div>
      {answers.habits?.activityLevel && (
        <p className="mt-4 text-center text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          Great — we’ll tune your plan to your routine.
        </p>
      )}
    </QuizCard>
  );
}
