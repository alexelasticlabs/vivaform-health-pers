import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';

export function MealTimingStep() {
  const { answers, updateAnswers } = useQuizStore();

  const meal = answers.mealTiming ?? {};

  return (
    <QuizCard
      title="When do you usually eat?"
      subtitle="We’ll align meal timing to your day"
      helpText="Use 24-hour format (e.g., 08:00)"
      emoji="⏰"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Breakfast</label>
          <Input
            placeholder="08:00"
            value={meal.breakfast ?? ''}
            onChange={(e) => updateAnswers({ mealTiming: { ...meal, breakfast: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Lunch</label>
          <Input
            placeholder="13:00"
            value={meal.lunch ?? ''}
            onChange={(e) => updateAnswers({ mealTiming: { ...meal, lunch: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Dinner</label>
          <Input
            placeholder="19:00"
            value={meal.dinner ?? ''}
            onChange={(e) => updateAnswers({ mealTiming: { ...meal, dinner: e.target.value || undefined } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Snacks (comma-separated)</label>
          <Input
            placeholder="10:30, 16:00"
            value={(meal.snacks ?? []).join(', ')}
            onChange={(e) => updateAnswers({ mealTiming: { ...meal, snacks: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined } })}
          />
        </div>
      </div>
    </QuizCard>
  );
}

