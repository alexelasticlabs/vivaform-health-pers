import { useEffect } from 'react';
import { QuizCard, SliderInput, ChoiceToggle } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { logQuizSliderChanged, logQuizToggleChanged } from '@/lib/analytics';

export function EnergyScheduleStep() {
  const { answers, updateAnswers } = useQuizStore();
  // Ensure default slider value is saved so Next isn't blocked
  useEffect(() => {
    if (answers.habits?.sleepHours === undefined) {
      updateAnswers({ habits: { sleepHours: 7 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QuizCard
      title="Energy and Schedule"
      subtitle="Tell us about your daily routine and activity"
      helpText="Sleep, exercise and timing influence your energy and hunger."
    >
      <div className="space-y-6">
        {/* Сон */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How many hours do you sleep per day?
          </label>
          <SliderInput
            value={answers.habits?.sleepHours ?? 7}
            onChange={(value) => { updateAnswers({ habits: { sleepHours: value } }); try { logQuizSliderChanged(useQuizStore.getState().clientId, 'energy_schedule', 'habits.sleepHours', value); } catch {} }}
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
          <ChoiceToggle
            label="I exercise regularly"
            selected={!!answers.habits?.exerciseRegularly}
            onClick={() => { const v = !answers.habits?.exerciseRegularly; updateAnswers({ habits: { exerciseRegularly: v } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'energy_schedule', 'habits.exerciseRegularly', v); } catch {} }}
          />
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
            data-testid="wake-time"
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
            data-testid="dinner-time"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </QuizCard>
  );
}
