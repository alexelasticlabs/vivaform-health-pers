import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function EnergyScheduleStep() {
  const { answers, updateAnswer } = useQuizStore();

  return (
    <QuizCard
      title="Энергия и режим"
      subtitle="Расскажите о вашем режиме дня и активности"
    >
      <div className="space-y-6">
        {/* Сон */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Сколько часов вы спите в сутки?
          </label>
          <SliderInput
            value={answers.sleepHours ?? 7}
            onChange={(value) => updateAnswer('sleepHours', value)}
            min={4}
            max={12}
            step={0.5}
            label={(value) => `${value} часов`}
          />
        </div>

        {/* Физическая активность */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Вы регулярно занимаетесь спортом?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.exerciseRegularly === true}
              onClick={() => updateAnswer('exerciseRegularly', true)}
            >
              ✅ Да, регулярно
            </OptionButton>
            <OptionButton
              selected={answers.exerciseRegularly === false}
              onClick={() => updateAnswer('exerciseRegularly', false)}
            >
              ❌ Нет
            </OptionButton>
          </div>
        </div>

        {/* Время пробуждения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Когда вы обычно просыпаетесь?
          </label>
          <input
            type="time"
            value={answers.wakeUpTime ?? '07:00'}
            onChange={(e) => updateAnswer('wakeUpTime', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Время ужина */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Когда вы обычно ужинаете?
          </label>
          <input
            type="time"
            value={answers.dinnerTime ?? '19:00'}
            onChange={(e) => updateAnswer('dinnerTime', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </QuizCard>
  );
}
