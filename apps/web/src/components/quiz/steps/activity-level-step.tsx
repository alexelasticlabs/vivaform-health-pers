import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { useQuizStore } from '../../../store/quiz-store';
import { ACTIVITY_LEVELS } from '@vivaform/shared';

export function ActivityLevelStep() {
  const { answers, updateAnswer, nextStep } = useQuizStore();

  const handleSelect = (level: string) => {
    updateAnswer('activityLevel', level as any);
    setTimeout(() => nextStep(), 300);
  };

  return (
    <QuizCard
      title="How active are you on an average day?"
      subtitle="This helps us calculate your daily calorie needs"
      emoji="🏃"
    >
      <div className="space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <OptionButton
            key={level.value}
            label={level.label}
            description={level.description}
            selected={answers.activityLevel === level.value}
            onClick={() => handleSelect(level.value)}
          />
        ))}
      </div>
      {answers.activityLevel && (
        <p className="text-center text-sm text-gray-600 mt-4">
          Good sleep and stable mealtimes help your metabolism stay steady 💫
        </p>
      )}
    </QuizCard>
  );
}
