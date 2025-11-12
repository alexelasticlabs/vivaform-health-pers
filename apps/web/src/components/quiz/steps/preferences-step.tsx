import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { logQuizOptionSelected, logQuizSliderChanged, logQuizToggleChanged } from '@/lib/analytics';
import { QuizCard, SliderInput, OptionPill, OptionTile, ChoiceToggle, COMMON_ALLERGENS, COMMON_AVOIDED_FOODS } from '@/components/quiz';

export function PreferencesStep() {
  const { answers, updateAnswers } = useQuizStore();
  const [customAllergy, setCustomAllergy] = useState('');
  const [customAvoided, setCustomAvoided] = useState('');

  const allergies = answers.habits?.foodAllergies ?? [];
  const avoided = answers.habits?.avoidedFoods ?? [];

  const toggleAllergy = (allergy: string) => {
    const newAllergies = allergies.includes(allergy)
      ? allergies.filter((a: string) => a !== allergy)
      : [...allergies, allergy];
    updateAnswers({ habits: { foodAllergies: newAllergies } });
    try {
      logQuizOptionSelected(useQuizStore.getState().clientId, 'preferences', 'habits.foodAllergies', newAllergies);
    } catch {}
  };

  const toggleAvoided = (food: string) => {
    const newAvoided = avoided.includes(food)
      ? avoided.filter((f: string) => f !== food)
      : [...avoided, food];
    updateAnswers({ habits: { avoidedFoods: newAvoided } });
    try {
      logQuizOptionSelected(useQuizStore.getState().clientId, 'preferences', 'habits.avoidedFoods', newAvoided);
    } catch {}
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      const next = [...allergies, customAllergy.trim()];
      updateAnswers({ habits: { foodAllergies: next } });
      try {
        logQuizOptionSelected(useQuizStore.getState().clientId, 'preferences', 'habits.foodAllergies', next);
      } catch {}
      setCustomAllergy('');
    }
  };

  const addCustomAvoided = () => {
    if (customAvoided.trim() && !avoided.includes(customAvoided.trim())) {
      const next = [...avoided, customAvoided.trim()];
      updateAnswers({ habits: { avoidedFoods: next } });
      try {
        logQuizOptionSelected(useQuizStore.getState().clientId, 'preferences', 'habits.avoidedFoods', next);
      } catch {}
      setCustomAvoided('');
    }
  };

  return (
    <QuizCard
      title="Food Preferences"
      subtitle="Specify your dietary restrictions and preferences"
      helpText="We’ll exclude allergens and respect your preferences in meal plans."
    >
      <div className="space-y-6">
        {/* Allergies */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            Do you have any food allergies? (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {COMMON_ALLERGENS.map((allergy) => (
              <OptionPill
                key={allergy}
                selected={allergies.includes(allergy)}
                onClick={() => toggleAllergy(allergy)}
                aria-label={`Allergy: ${allergy}`}
              >
                {allergy}
              </OptionPill>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
              placeholder="Other allergy..."
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2"
            />
            <button
              onClick={addCustomAllergy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
            >
              Add
            </button>
          </div>
          {allergies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {allergies.map((allergy: string) => (
                <span
                  key={allergy}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200"
                >
                  {allergy}
                  <button
                    onClick={() => toggleAllergy(allergy)}
                    className="hover:text-red-900 dark:hover:text-red-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Avoided foods */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            What foods do you avoid? (by personal preference)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {COMMON_AVOIDED_FOODS.map((food) => (
              <OptionPill
                key={food}
                selected={avoided.includes(food)}
                onClick={() => toggleAvoided(food)}
                aria-label={`Avoid: ${food}`}
              >
                {food}
              </OptionPill>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAvoided}
              onChange={(e) => setCustomAvoided(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomAvoided()}
              placeholder="Other food..."
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2"
            />
            <button
              onClick={addCustomAvoided}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
            >
              Add
            </button>
          </div>
          {avoided.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {avoided.map((food: string) => (
                <span
                  key={food}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-200"
                >
                  {food}
                  <button
                    onClick={() => toggleAvoided(food)}
                    className="hover:text-orange-900 dark:hover:text-orange-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meal complexity */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            What kind of meals do you prefer?
          </label>
          <div className="space-y-2">
            {[
              { value: 'simple', label: '🍳 Simple (5-15 min)' },
              { value: 'medium', label: '👨‍🍳 Medium (15-30 min)' },
              { value: 'complex', label: '👨‍🍳 Complex (30+ min)' },
            ].map((option) => (
              <OptionTile
                key={option.value}
                title={option.label}
                selected={answers.habits?.mealComplexity === option.value}
                onClick={() => { updateAnswers({ habits: { mealComplexity: option.value as 'simple' | 'medium' | 'complex' } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'preferences', 'habits.mealComplexity', option.value); } catch {} }}
                aria-label={`Meal complexity: ${option.label}`}
              />
            ))}
          </div>
        </div>

        {/* New dishes preference */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            Do you like trying new dishes?
          </label>
          <ChoiceToggle
            label="I like trying new dishes"
            selected={!!answers.habits?.tryNewFoods}
            onClick={() => { const v = !answers.habits?.tryNewFoods; updateAnswers({ habits: { tryNewFoods: v } }); try { logQuizToggleChanged(useQuizStore.getState().clientId, 'preferences', 'habits.tryNewFoods', v); } catch {} }}
          />
        </div>

        {/* Cooking time per day */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground/80">
            How much time are you willing to spend cooking per day?
          </label>
          <SliderInput
            value={answers.habits?.cookingTimeMinutes ?? 30}
            onChange={(value) => { updateAnswers({ habits: { cookingTimeMinutes: value } }); try { logQuizSliderChanged(useQuizStore.getState().clientId, 'preferences', 'habits.cookingTimeMinutes', value); } catch {} }}
            min={0}
            max={120}
            step={15}
            label={(value) => `${value} minutes`}
          />
        </div>
      </div>
    </QuizCard>
  );
}
