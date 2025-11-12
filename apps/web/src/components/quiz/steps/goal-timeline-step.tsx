import { QuizCard, OptionPill } from '@/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { GOAL_TIMELINES } from '@vivaform/shared';
import { logQuizOptionSelected } from '@/lib/analytics';

export function GoalTimelineStep() {
  const { answers, updateAnswers } = useQuizStore();

  const handleSelect = (timeline: string) => {
    const months = timeline === '1_month' ? 1 : timeline === '3_months' ? 3 : timeline === '6_months' ? 6 : 12;
    updateAnswers({ goals: { etaMonths: months } });
    try { logQuizOptionSelected(useQuizStore.getState().clientId, 'goal_timeline', 'goals.etaMonths', months); } catch {}
  };

  return (
    <QuizCard
      title="When would you like to reach your goal?"
      subtitle="Be realistic — sustainable progress is better than rushing"
      helpText="Aim for a timeline you can comfortably maintain."
      emoji="⏰"
    >
      <div className="flex flex-wrap gap-2">
        {GOAL_TIMELINES.map((timeline) => (
          <OptionPill
            key={timeline.value}
            selected={answers.goals?.etaMonths === (timeline.value === '1_month' ? 1 : timeline.value === '3_months' ? 3 : timeline.value === '6_months' ? 6 : 12)}
            onClick={() => handleSelect(timeline.value)}
            aria-label={`Choose ${timeline.label}`}
          >
            {timeline.label}
          </OptionPill>
        ))}
      </div>
      {answers.goals?.etaMonths !== undefined && (
        <p className="mt-4 text-center text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          Got it — pacing your progress helps sustainability.
        </p>
      )}
    </QuizCard>
  );
}
