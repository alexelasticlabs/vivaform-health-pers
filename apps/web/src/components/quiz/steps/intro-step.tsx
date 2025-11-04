import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { useQuizStore } from '../../../store/quiz-store';
import { DIET_PLANS } from '@vivaform/shared';

export function IntroStep() {
  const { answers, updateAnswers } = useQuizStore();

  const handleSelect = (plan: string) => {
    updateAnswers({ diet: { plan } });
  };

  return (
    <QuizCard
      title="Which diet plan are you interested in?"
      subtitle="Don't worry — we'll personalize this based on your goals"
      emoji="🌿"
    >
      <div className="space-y-3">
        {DIET_PLANS.map((plan) => (
          <OptionButton
            key={plan.value}
            label={plan.label}
            description={plan.description}
            selected={answers.dietPlan === plan.value}
            onClick={() => handleSelect(plan.value)}
          />
        ))}
      </div>
      {answers.dietPlan && (
        <p className="text-center text-sm text-gray-600 mt-4 animate-fade-in">
          Excellent choice — a balanced diet supports long-term health ❤️
        </p>
      )}
    </QuizCard>
  );
}
