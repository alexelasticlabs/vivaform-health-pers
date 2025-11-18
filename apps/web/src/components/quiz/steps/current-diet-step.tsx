import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';

export function CurrentDietStep() {
  const { answers, updateAnswers } = useQuizStore();
  const diet = (answers.currentDiet as any) ?? {};

  return (
    <QuizCard
      title="What do you usually eat?"
      subtitle="This helps us understand your current habits"
      helpText="Short descriptions are fine. Example: Oatmeal with berries, Chicken salad, etc."
      emoji="🍽️"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Breakfast</label>
          <Input
            placeholder="e.g., Oatmeal with berries"
            value={diet.breakfast ?? ''}
            onChange={(e) => updateAnswers({ currentDiet: { ...diet, breakfast: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Lunch</label>
          <Input
            placeholder="e.g., Chicken salad"
            value={diet.lunch ?? ''}
            onChange={(e) => updateAnswers({ currentDiet: { ...diet, lunch: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Dinner</label>
          <Input
            placeholder="e.g., Salmon with rice"
            value={diet.dinner ?? ''}
            onChange={(e) => updateAnswers({ currentDiet: { ...diet, dinner: e.target.value || undefined } })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1 block">Typical day (optional)</label>
          <textarea
            placeholder="Write a few lines about a typical day of eating"
            value={diet.typicalDay ?? ''}
            onChange={(e) => updateAnswers({ currentDiet: { ...diet, typicalDay: e.target.value || undefined } })}
            className="w-full min-h-[96px] rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </div>
    </QuizCard>
  );
}

