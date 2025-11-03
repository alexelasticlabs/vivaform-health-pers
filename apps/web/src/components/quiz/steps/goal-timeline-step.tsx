import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { useQuizStore } from '../../../store/quiz-store';
import { GOAL_TIMELINES } from '@vivaform/shared';

export function GoalTimelineStep() {
  const { answers, updateAnswer, nextStep } = useQuizStore();

  const handleSelect = (timeline: string) => {
    updateAnswer('goalTimeline', timeline as any);
    setTimeout(() => nextStep(), 300);
  };

  return (
    <QuizCard
      title="When would you like to reach your goal?"
      subtitle="Be realistic — sustainable progress is better than rushing"
      emoji="⏰"
    >
      <div className="space-y-3">
        {GOAL_TIMELINES.map((timeline) => (
          <OptionButton
            key={timeline.value}
            label={timeline.label}
            selected={answers.goalTimeline === timeline.value}
            onClick={() => handleSelect(timeline.value)}
          />
        ))}
      </div>
    </QuizCard>
  );
}
