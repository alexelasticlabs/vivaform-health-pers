import { useState } from 'react';
import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

const COMMON_ALLERGENS = [
  'Gluten',
  'Lactose',
  'Nuts',
  'Seafood',
  'Eggs',
  'Soy',
  'Fish',
];

const COMMON_AVOIDED_FOODS = [
  'Meat',
  'Dairy',
  'Sugar',
  'Alcohol',
  'Caffeine',
  'Spicy food',
  'Fried food',
];

export function PreferencesStep() {
  const { answers, updateAnswer } = useQuizStore();
  const [customAllergy, setCustomAllergy] = useState('');
  const [customAvoided, setCustomAvoided] = useState('');

  const allergies = answers.foodAllergies ?? [];
  const avoided = answers.avoidedFoods ?? [];

  const toggleAllergy = (allergy: string) => {
    const newAllergies = allergies.includes(allergy)
      ? allergies.filter((a) => a !== allergy)
      : [...allergies, allergy];
    updateAnswer('foodAllergies', newAllergies);
  };

  const toggleAvoided = (food: string) => {
    const newAvoided = avoided.includes(food)
      ? avoided.filter((f) => f !== food)
      : [...avoided, food];
    updateAnswer('avoidedFoods', newAvoided);
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      updateAnswer('foodAllergies', [...allergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const addCustomAvoided = () => {
    if (customAvoided.trim() && !avoided.includes(customAvoided.trim())) {
      updateAnswer('avoidedFoods', [...avoided, customAvoided.trim()]);
      setCustomAvoided('');
    }
  };

  return (
    <QuizCard
      title="Food Preferences"
      subtitle="Specify your dietary restrictions and preferences"
    >
      <div className="space-y-6">
        {/* Аллергии */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you have any food allergies? (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {COMMON_ALLERGENS.map((allergy) => (
              <OptionButton
                key={allergy}
                selected={allergies.includes(allergy)}
                onClick={() => toggleAllergy(allergy)}
                className="text-sm"
              >
                {allergy}
              </OptionButton>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
              placeholder="Other allergy..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addCustomAllergy}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {allergies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {allergy}
                  <button
                    onClick={() => toggleAllergy(allergy)}
                    className="hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Избегаемые продукты */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What foods do you avoid? (by personal preference)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {COMMON_AVOIDED_FOODS.map((food) => (
              <OptionButton
                key={food}
                selected={avoided.includes(food)}
                onClick={() => toggleAvoided(food)}
                className="text-sm"
              >
                {food}
              </OptionButton>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAvoided}
              onChange={(e) => setCustomAvoided(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomAvoided()}
              placeholder="Other food..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addCustomAvoided}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {avoided.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {avoided.map((food) => (
                <span
                  key={food}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {food}
                  <button
                    onClick={() => toggleAvoided(food)}
                    className="hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Сложность блюд */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What kind of meals do you prefer?
          </label>
          <div className="space-y-2">
            {[
              { value: 'simple', label: '🍳 Simple (5-15 min)' },
              { value: 'medium', label: '👨‍🍳 Medium (15-30 min)' },
              { value: 'complex', label: '👨‍🍳 Complex (30+ min)' },
            ].map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.mealComplexity === option.value}
                onClick={() => updateAnswer('mealComplexity', option.value as 'simple' | 'medium' | 'complex')}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Готовность пробовать новое */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you like trying new dishes?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.tryNewFoods === true}
              onClick={() => updateAnswer('tryNewFoods', true)}
            >
              ✅ Yes, I love experimenting
            </OptionButton>
            <OptionButton
              selected={answers.tryNewFoods === false}
              onClick={() => updateAnswer('tryNewFoods', false)}
            >
              ❌ No, I prefer familiar foods
            </OptionButton>
          </div>
        </div>

        {/* Время на готовку */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How much time are you willing to spend cooking per day?
          </label>
          <SliderInput
            value={answers.cookingTimeMinutes ?? 30}
            onChange={(value) => updateAnswer('cookingTimeMinutes', value)}
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
