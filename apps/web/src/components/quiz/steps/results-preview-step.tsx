import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

export function ResultsPreviewStep() {
  const { answers } = useQuizStore();

  return (
    <QuizCard
      title="Your personalized plan is ready"
      subtitle="Here’s a preview of what you’ll get"
      emoji="✨"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Calories</p>
          <div className="h-2 mt-2 bg-emerald-200 rounded">
            <div className="h-2 bg-emerald-600 rounded" style={{ width: '70%' }} />
          </div>
          <p className="text-xs text-neutral-500 mt-1">Daily target tailored to your goal</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Macros</p>
          <div className="h-2 mt-2 bg-blue-200 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: '40%' }} />
          </div>
          <p className="text-xs text-neutral-500 mt-1">Balanced carbs/protein/fats</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Meal schedule</p>
          <ul className="mt-2 text-sm list-disc pl-5">
            <li>3 meals + 2 snacks</li>
            <li>Aligned with your day</li>
          </ul>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Training</p>
          <ul className="mt-2 text-sm list-disc pl-5">
            <li>3x per week, ~30 minutes</li>
            <li>Beginner friendly</li>
          </ul>
        </div>
      </div>
    </QuizCard>
  );
}

