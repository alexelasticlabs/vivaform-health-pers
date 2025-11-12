import { useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard, SliderInput, ChoiceToggle, OptionPill } from '@/components/quiz';
import { logQuizSliderChanged, logQuizToggleChanged, logQuizOptionSelected } from '@/lib/analytics';

export function HydrationStep() {
  const { answers, updateAnswers } = useQuizStore();
  // Ensure default water value is saved so Next isn't blocked
  useEffect(() => {
    if (answers.habits?.dailyWaterMl === undefined) {
      updateAnswers({ habits: { dailyWaterMl: 2000 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QuizCard
      title="Hydration & Tracking"
      subtitle="Final step! Set up helpful reminders and tracking"
      helpText="Water, reminders and health app sync keep you on track."
    >
      <div className="space-y-6">
        {/* Потребление воды */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            How much water do you drink per day? (ml)
          </label>
          <SliderInput
            value={answers.habits?.dailyWaterMl ?? 2000}
            onChange={(value) => { updateAnswers({ habits: { dailyWaterMl: value } }); try { logQuizSliderChanged(useQuizStore.getState().clientId, 'hydration', 'habits.dailyWaterMl', value); } catch {} }}
            min={500}
            max={5000}
            step={250}
            label={(value) => {
              const liters = (value / 1000).toFixed(1);
              return `${value} ml (${liters} L)`;
            }}
          />
          <div className="mt-2 text-sm text-muted-foreground">
            💡 Recommended: 2000–3000 ml per day (8–12 cups)
          </div>
        </div>

        {/* Напоминания */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            Would you like to receive reminders about meals and water?
          </label>
          <ChoiceToggle
            label="Enable meal and hydration reminders"
            selected={!!answers.habits?.wantReminders}
            onClick={() => { const v = !answers.habits?.wantReminders; updateAnswers({ habits: { wantReminders: v } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'hydration', 'habits.wantReminders', v); } catch {} }}
          />
        </div>

        {/* Трекинг активности */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            Would you like to track physical activity?
          </label>
          <ChoiceToggle
            label="Track physical activity"
            selected={!!answers.habits?.trackActivity}
            onClick={() => { const v = !answers.habits?.trackActivity; updateAnswers({ habits: { trackActivity: v } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'hydration', 'habits.trackActivity', v); } catch {} }}
          />
        </div>

        {/* Интеграция с Health Apps */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            Connect Apple Health / Google Fit?
          </label>
          <ChoiceToggle
            label="Connect Apple Health / Google Fit"
            selected={!!answers.habits?.connectHealthApp}
            onClick={() => { const v = !answers.habits?.connectHealthApp; updateAnswers({ habits: { connectHealthApp: v } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'hydration', 'habits.connectHealthApp', v); } catch {} }}
          />
          {answers.habits?.connectHealthApp && (
            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              ℹ️ Health app sync will be available after registration
            </div>
          )}
        </div>

        {/* Тема приложения */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            Choose app theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: '☀️ Light' },
              { value: 'dark', label: '🌙 Dark' },
              { value: 'auto', label: '🔄 Auto' },
            ].map((t) => (
              <OptionPill
                key={t.value}
                selected={answers.habits?.theme === t.value}
                onClick={() => { updateAnswers({ habits: { theme: t.value } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'hydration', 'habits.theme', t.value); } catch {} }}
                aria-label={`Theme: ${t.value}`}
              >
                {t.label}
              </OptionPill>
            ))}
          </div>
        </div>
      </div>
    </QuizCard>
  );
}
