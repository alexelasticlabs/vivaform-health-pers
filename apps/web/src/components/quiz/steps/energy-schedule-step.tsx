import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function EnergyScheduleStep() {
  const { answers, updateAnswers } = useQuizStore();

  return (
    <QuizCard
      title="Energy and Schedule"
      subtitle="Tell us about your daily routine and activity"
    >
      <div className="space-y-6">
        {/* Сон */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How many hours do you sleep per day?
          </label>
          <SliderInput
            value={answers.habits?.sleepHours ?? 7}
            onChange={(value) => updateAnswers({ habits: { sleepHours: value } })}
            min={4}
            max={12}
            step={0.5}
            label={(value) => `${value} hours`}
          />
        </div>

        {/* Физическая активность */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you exercise regularly?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.habits?.exerciseRegularly === true}
              onClick={() => updateAnswers({ habits: { exerciseRegularly: true } })}
            >
              ✅ Yes, regularly
            </OptionButton>
            <OptionButton
              selected={answers.habits?.exerciseRegularly === false}
              onClick={() => updateAnswers({ habits: { exerciseRegularly: false } })}
            >
              ❌ No
            </OptionButton>
          </div>
        </div>

        {/* Время пробуждения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            When do you usually wake up?
          </label>
          <input
            type="time"
            value={answers.habits?.wakeUpTime ?? '07:00'}
            onChange={(e) => updateAnswers({ habits: { wakeUpTime: e.target.value } })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Время ужина */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            When do you usually have dinner?
          </label>
          <input
            type="time"
            value={answers.habits?.dinnerTime ?? '19:00'}
            onChange={(e) => updateAnswers({ habits: { dinnerTime: e.target.value } })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </QuizCard>
  );
}
