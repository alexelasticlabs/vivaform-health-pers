import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionPill } from '../options/option-pill';
import { OptionTile } from '../options/option-tile';
import { logQuizOptionSelected, logQuizToggleChanged } from '../../../lib/analytics';

export function FoodHabitsStep() {
  const { answers, updateAnswers } = useQuizStore();

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
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4, 5, 6].map((meals) => (
              <OptionPill
                key={meals}
                selected={answers.habits?.mealsPerDay === meals}
                onClick={() => { updateAnswers({ habits: { mealsPerDay: meals } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'food_habits', 'habits.mealsPerDay', meals); } catch {} }}
                aria-label={`Eat ${meals} times per day`}
              >
                {meals}x/day
              </OptionPill>
            ))}
          </div>
        </div>

        {/* Пропуск завтрака */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you eat breakfast?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <OptionPill
              selected={answers.habits?.skipBreakfast === false}
              onClick={() => { updateAnswers({ habits: { skipBreakfast: false } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'food_habits', 'habits.skipBreakfast', false); } catch {} }}
              aria-label="Yes, eat breakfast"
            >
              ✅ Yes, regularly
            </OptionPill>
            <OptionPill
              selected={answers.habits?.skipBreakfast === true}
              onClick={() => { updateAnswers({ habits: { skipBreakfast: true } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'food_habits', 'habits.skipBreakfast', true); } catch {} }}
              aria-label="No, skip breakfast"
            >
              ❌ No, I skip it
            </OptionPill>
          </div>
        </div>

        {/* Перекусы */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you snack between meals?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <OptionPill
              selected={answers.habits?.snackBetweenMeals === true}
              onClick={() => { updateAnswers({ habits: { snackBetweenMeals: true } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'food_habits', 'habits.snackBetweenMeals', true); } catch {} }}
              aria-label="Yes, snack between meals"
            >
              Yes, often
            </OptionPill>
            <OptionPill
              selected={answers.habits?.snackBetweenMeals === false}
              onClick={() => { updateAnswers({ habits: { snackBetweenMeals: false } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'food_habits', 'habits.snackBetweenMeals', false); } catch {} }}
              aria-label="No, rarely snack"
            >
              No, rarely
            </OptionPill>
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
              <OptionTile
                key={option.value}
                title={option.label}
                selected={answers.habits?.fastFoodFrequency === option.value}
                onClick={() => { const v = option.value as 'never' | 'rarely' | 'sometimes' | 'often' | 'daily'; updateAnswers({ habits: { fastFoodFrequency: v } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'food_habits', 'habits.fastFoodFrequency', v); } catch {} }}
                aria-label={`Fast food: ${option.label}`}
              />
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
              <OptionTile
                key={option.value}
                title={option.label}
                selected={answers.habits?.cookAtHomeFrequency === option.value}
                onClick={() => { const v = option.value as 'never' | 'rarely' | 'sometimes' | 'often' | 'daily'; updateAnswers({ habits: { cookAtHomeFrequency: v } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'food_habits', 'habits.cookAtHomeFrequency', v); } catch {} }}
                aria-label={`Cook at home: ${option.label}`}
              />
            ))}
          </div>
        </div>
      </div>
    </QuizCard>
  );
}
