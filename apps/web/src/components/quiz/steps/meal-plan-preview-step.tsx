import { QuizCard } from '@/components/quiz';

export function MealPlanPreviewStep() {
  return (
    <QuizCard
      title="A day on your plan"
      subtitle="Here’s what a typical day could look like"
      emoji="🍱"
    >
      <div className="space-y-2 text-sm">
        <div>🥣 Breakfast: Oatmeal with berries (350 kcal)</div>
        <div>🥛 Snack: Greek yogurt (120 kcal)</div>
        <div>🍽️ Lunch: Chicken with veggies (450 kcal)</div>
        <div>🥜 Snack: Nuts (180 kcal)</div>
        <div>🍣 Dinner: Salmon with quinoa (520 kcal)</div>
        <div className="text-neutral-500 mt-2">Total: ~1,620 kcal | ~120g protein</div>
      </div>
    </QuizCard>
  );
}

