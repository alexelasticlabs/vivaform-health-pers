import { QuizCard, OptionTile } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { logQuizOptionSelected } from '@/lib/analytics';
import { DIET_PLANS } from '@vivaform/shared';

export function IntroStep() {
  const { answers, updateAnswers } = useQuizStore();

  const handleSelect = (value: string) => {
    updateAnswers({ diet: { plan: value } });
    try { logQuizOptionSelected(useQuizStore.getState().clientId, 'intro', 'diet.plan', value); } catch {}
  };

  return (
    <QuizCard
      title="Which diet plan are you interested in?"
      subtitle="Don't worry — we'll personalize this based on your goals"
      helpText="We use this to tailor meal templates and ingredient suggestions."
      emoji="🌿"
    >
      <div className="space-y-3">
        {DIET_PLANS.map((plan) => (
          <OptionTile
            key={plan.value}
            title={plan.label}
            description={plan.description}
            selected={answers.diet?.plan === plan.value}
            onClick={() => handleSelect(plan.value)}
            aria-label={`Choose ${plan.label}`}
          />
        ))}
      </div>
      {answers.diet?.plan && (
        <p className="text-center text-sm text-emerald-700 dark:text-emerald-300 mt-4 animate-in fade-in">
          Great choice! We’ll personalize recipes around it. ✓
        </p>
      )}
    </QuizCard>
  );
}
