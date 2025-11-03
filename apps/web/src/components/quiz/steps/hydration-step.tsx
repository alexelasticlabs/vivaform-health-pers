import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function HydrationStep() {
  const { answers, updateAnswer } = useQuizStore();

  return (
    <QuizCard
      title="Гидратация и трекинг"
      subtitle="Последний шаг! Настроим отслеживание прогресса"
    >
      <div className="space-y-6">
        {/* Потребление воды */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Сколько воды вы выпиваете в день? (мл)
          </label>
          <SliderInput
            value={answers.dailyWaterMl ?? 2000}
            onChange={(value) => updateAnswer('dailyWaterMl', value)}
            min={500}
            max={5000}
            step={250}
            label={(value) => {
              const liters = (value / 1000).toFixed(1);
              return `${value} мл (${liters} л)`;
            }}
          />
          <div className="mt-2 text-sm text-gray-600">
            💡 Рекомендуется: 2000-3000 мл в день (8-12 стаканов)
          </div>
        </div>

        {/* Напоминания */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Хотите получать напоминания о питании и воде?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.wantReminders === true}
              onClick={() => updateAnswer('wantReminders', true)}
            >
              ✅ Да, помогите мне
            </OptionButton>
            <OptionButton
              selected={answers.wantReminders === false}
              onClick={() => updateAnswer('wantReminders', false)}
            >
              ❌ Нет, справлюсь сам
            </OptionButton>
          </div>
        </div>

        {/* Трекинг активности */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Вы хотите отслеживать физическую активность?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.trackActivity === true}
              onClick={() => updateAnswer('trackActivity', true)}
            >
              ✅ Да
            </OptionButton>
            <OptionButton
              selected={answers.trackActivity === false}
              onClick={() => updateAnswer('trackActivity', false)}
            >
              ❌ Нет
            </OptionButton>
          </div>
        </div>

        {/* Интеграция с Health Apps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Подключить Apple Health / Google Fit?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.connectHealthApp === true}
              onClick={() => updateAnswer('connectHealthApp', true)}
            >
              ✅ Да, синхронизировать
            </OptionButton>
            <OptionButton
              selected={answers.connectHealthApp === false}
              onClick={() => updateAnswer('connectHealthApp', false)}
            >
              ❌ Нет, не нужно
            </OptionButton>
          </div>
          {answers.connectHealthApp && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              ℹ️ Интеграция будет доступна после регистрации
            </div>
          )}
        </div>

        {/* Тема приложения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Выберите тему приложения
          </label>
          <div className="grid grid-cols-3 gap-3">
            <OptionButton
              selected={answers.theme === 'light'}
              onClick={() => updateAnswer('theme', 'light')}
            >
              ☀️ Светлая
            </OptionButton>
            <OptionButton
              selected={answers.theme === 'dark'}
              onClick={() => updateAnswer('theme', 'dark')}
            >
              🌙 Тёмная
            </OptionButton>
            <OptionButton
              selected={answers.theme === 'auto'}
              onClick={() => updateAnswer('theme', 'auto')}
            >
              🔄 Авто
            </OptionButton>
          </div>
        </div>
      </div>
    </QuizCard>
  );
}
