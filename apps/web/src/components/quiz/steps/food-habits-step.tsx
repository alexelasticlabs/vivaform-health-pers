import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function FoodHabitsStep() {
  const { answers, updateAnswer } = useQuizStore();

  return (
    <QuizCard
      title="Ваши пищевые привычки"
      subtitle="Расскажите о ваших текущих привычках в питании"
    >
      <div className="space-y-6">
        {/* Количество приёмов пищи */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Сколько раз в день вы едите?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[2, 3, 4, 5, 6].map((meals) => (
              <OptionButton
                key={meals}
                selected={answers.mealsPerDay === meals}
                onClick={() => updateAnswer('mealsPerDay', meals)}
              >
                {meals} {meals === 2 ? 'раза' : 'раз'}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Пропуск завтрака */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Вы завтракаете?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.skipBreakfast === false}
              onClick={() => updateAnswer('skipBreakfast', false)}
            >
              ✅ Да, регулярно
            </OptionButton>
            <OptionButton
              selected={answers.skipBreakfast === true}
              onClick={() => updateAnswer('skipBreakfast', true)}
            >
              ❌ Нет, пропускаю
            </OptionButton>
          </div>
        </div>

        {/* Перекусы */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Вы перекусываете между приёмами пищи?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.snackBetweenMeals === true}
              onClick={() => updateAnswer('snackBetweenMeals', true)}
            >
              Да, часто
            </OptionButton>
            <OptionButton
              selected={answers.snackBetweenMeals === false}
              onClick={() => updateAnswer('snackBetweenMeals', false)}
            >
              Нет, редко
            </OptionButton>
          </div>
        </div>

        {/* Фастфуд */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Как часто вы едите фастфуд?
          </label>
          <div className="space-y-2">
            {[
              { value: 'never', label: 'Никогда' },
              { value: 'rarely', label: 'Редко (раз в месяц)' },
              { value: 'sometimes', label: 'Иногда (раз в неделю)' },
              { value: 'often', label: 'Часто (несколько раз в неделю)' },
              { value: 'daily', label: 'Ежедневно' },
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
            Как часто вы готовите дома?
          </label>
          <div className="space-y-2">
            {[
              { value: 'never', label: 'Никогда' },
              { value: 'rarely', label: 'Редко' },
              { value: 'sometimes', label: 'Иногда' },
              { value: 'often', label: 'Часто' },
              { value: 'always', label: 'Всегда' },
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
