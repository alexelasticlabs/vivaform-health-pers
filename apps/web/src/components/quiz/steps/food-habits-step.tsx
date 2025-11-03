import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function FoodHabitsStep() {
  const { answers, updateAnswer } = useQuizStore();

  return (
    <QuizCard
      title="Your Eating Habits"
      subtitle="Tell us about your current nutrition habits"
    >
      <div className="space-y-6">
        {/* Количество приёмов пищи */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How many times per day do you eat?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[2, 3, 4, 5, 6].map((meals) => (
              <OptionButton
                key={meals}
                selected={answers.mealsPerDay === meals}
                onClick={() => updateAnswer('mealsPerDay', meals)}
              >
                {meals} {meals === 2 ? 'times' : 'times'}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Пропуск завтрака */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you eat breakfast?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.skipBreakfast === false}
              onClick={() => updateAnswer('skipBreakfast', false)}
            >
              ✅ Yes, regularly
            </OptionButton>
            <OptionButton
              selected={answers.skipBreakfast === true}
              onClick={() => updateAnswer('skipBreakfast', true)}
            >
              ❌ No, I skip it
            </OptionButton>
          </div>
        </div>

        {/* Перекусы */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you snack between meals?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.snackBetweenMeals === true}
              onClick={() => updateAnswer('snackBetweenMeals', true)}
            >
              Yes, often
            </OptionButton>
            <OptionButton
              selected={answers.snackBetweenMeals === false}
              onClick={() => updateAnswer('snackBetweenMeals', false)}
            >
              No, rarely
            </OptionButton>
          </div>
        </div>

        {/* Фастфуд */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How often do you eat fast food?
          </label>
          <div className="space-y-2">
            {[
              { value: 'never', label: 'Never' },
              { value: 'rarely', label: 'Rarely (once a month)' },
              { value: 'sometimes', label: 'Sometimes (once a week)' },
              { value: 'often', label: 'Often (several times a week)' },
              { value: 'daily', label: 'Daily' },
            ].map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.fastFoodFrequency === option.value}
                onClick={() => updateAnswer('fastFoodFrequency', option.value as 'never' | 'rarely' | 'sometimes' | 'often' | 'daily')}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Домашняя еда */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How often do you cook at home?
          </label>
          <div className="space-y-2">
            {[
              { value: 'never', label: 'Never' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'often', label: 'Often' },
              { value: 'always', label: 'Always' },
            ].map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.cookAtHomeFrequency === option.value}
                onClick={() => updateAnswer('cookAtHomeFrequency', option.value as 'never' | 'rarely' | 'sometimes' | 'often' | 'daily')}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>
    </QuizCard>
  );
}
