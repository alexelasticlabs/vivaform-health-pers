import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { useQuizStore } from '../../../store/quiz-store';
import { GOAL_TIMELINES } from '@vivaform/shared';

export function GoalTimelineStep() {
  const { answers, updateAnswers } = useQuizStore();

  const handleSelect = (timeline: string) => {
    const months = timeline === '1' ? 1 : timeline === '3' ? 3 : timeline === '6' ? 6 : 12;
    updateAnswers({ goals: { etaMonths: months } });
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
