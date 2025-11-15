import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Clock, Coffee, Soup, Utensils, Cookie } from 'lucide-react';

const MDiv = motion.div as any;

export function MealTimingStep() {
  const { answers, updateAnswers } = useQuizStore();

  const meal = answers.mealTiming ?? {};

  const mealIcons = {
    breakfast: <Coffee className="w-5 h-5 text-amber-500" />,
    lunch: <Soup className="w-5 h-5 text-orange-500" />,
    dinner: <Utensils className="w-5 h-5 text-rose-500" />,
    snacks: <Cookie className="w-5 h-5 text-yellow-500" />
  };

  return (
    <QuizCard
      title="When do you usually eat?"
      subtitle="We'll align meal timing to your natural rhythm and schedule"
      helpText="This helps us optimize your energy levels throughout the day"
      emoji="⏰"
    >
      <div className="space-y-4">
        {/* Visual timeline preview */}
        {(meal.breakfast || meal.lunch || meal.dinner) && (
          <MDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Your Daily Schedule</span>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {meal.breakfast && <span className="bg-white dark:bg-neutral-900 px-2 py-1 rounded">🌅 {meal.breakfast}</span>}
              {meal.lunch && <span className="bg-white dark:bg-neutral-900 px-2 py-1 rounded">☀️ {meal.lunch}</span>}
              {meal.dinner && <span className="bg-white dark:bg-neutral-900 px-2 py-1 rounded">🌙 {meal.dinner}</span>}
            </div>
          </MDiv>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              {mealIcons.breakfast}
              <span>Breakfast</span>
              <span className="text-xs text-neutral-500">(optional)</span>
            </label>
            <Input
              placeholder="08:00"
              value={meal.breakfast ?? ''}
              onChange={(e) => updateAnswers({ mealTiming: { ...meal, breakfast: e.target.value || undefined } })}
            />
            <p className="text-xs text-neutral-500 mt-1">Ideal: 7:00-10:00</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              {mealIcons.lunch}
              <span>Lunch</span>
              <span className="text-xs text-neutral-500">(optional)</span>
            </label>
            <Input
              placeholder="13:00"
              value={meal.lunch ?? ''}
              onChange={(e) => updateAnswers({ mealTiming: { ...meal, lunch: e.target.value || undefined } })}
            />
            <p className="text-xs text-neutral-500 mt-1">Ideal: 12:00-14:00</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              {mealIcons.dinner}
              <span>Dinner</span>
              <span className="text-xs text-neutral-500">(optional)</span>
            </label>
            <Input
              placeholder="19:00"
              value={meal.dinner ?? ''}
              onChange={(e) => updateAnswers({ mealTiming: { ...meal, dinner: e.target.value || undefined } })}
            />
            <p className="text-xs text-neutral-500 mt-1">Ideal: 18:00-20:00</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              {mealIcons.snacks}
              <span>Snacks</span>
              <span className="text-xs text-neutral-500">(optional)</span>
            </label>
            <Input
              placeholder="10:30, 16:00"
              value={(meal.snacks ?? []).join(', ')}
              onChange={(e) => updateAnswers({ mealTiming: { ...meal, snacks: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined } })}
            />
            <p className="text-xs text-neutral-500 mt-1">Comma-separated times</p>
          </div>
        </div>

        <MDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Consistent meal times help regulate metabolism and energy levels!
          </p>
        </MDiv>
      </div>
    </QuizCard>
  );
}

