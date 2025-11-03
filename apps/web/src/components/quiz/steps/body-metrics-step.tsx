import { useState, useEffect } from 'react';
import { QuizCard } from '../quiz-card';
import { SliderInput } from '../slider-input';
import { BMIIndicator } from '../bmi-indicator';
import { useQuizStore } from '../../../store/quiz-store';

type UnitSystem = 'metric' | 'imperial';

export function BodyMetricsStep() {
  const { answers, updateAnswer } = useQuizStore();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [heightCm, setHeightCm] = useState(answers.heightCm || 170);
  const [weightKg, setWeightKg] = useState(answers.currentWeightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState(
    answers.targetWeightKg || 65,
  );

  // Conversion helpers
  const cmToFeet = (cm: number) => Math.floor(cm / 30.48);
  const cmToInches = (cm: number) => Math.round((cm % 30.48) / 2.54);
  const feetInchesToCm = (feet: number, inches: number) => Math.round(feet * 30.48 + inches * 2.54);
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462);
  const lbsToKg = (lbs: number) => Math.round(lbs / 2.20462);

  // Display values in current unit system
  const heightFeet = cmToFeet(heightCm);
  const heightInches = cmToInches(heightCm);
  const weightLbs = kgToLbs(weightKg);
  const targetWeightLbs = kgToLbs(targetWeightKg);

  const calculateBMI = () => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const bmi = calculateBMI();

  // Auto-adjust target weight if it becomes invalid after height/weight changes
  useEffect(() => {
    // Ensure target weight stays within reasonable bounds relative to current weight
    const minTarget = Math.max(40, weightKg - 50); // Max 50kg loss
    const maxTarget = Math.min(200, weightKg + 30); // Max 30kg gain
    
    if (targetWeightKg < minTarget) {
      setTargetWeightKg(minTarget);
    } else if (targetWeightKg > maxTarget) {
      setTargetWeightKg(maxTarget);
    }
  }, [weightKg, targetWeightKg]);

  useEffect(() => {
    updateAnswer('heightCm', heightCm);
  }, [heightCm, updateAnswer]);

  useEffect(() => {
    updateAnswer('currentWeightKg', weightKg);
  }, [weightKg, updateAnswer]);

  useEffect(() => {
    updateAnswer('targetWeightKg', targetWeightKg);
  }, [targetWeightKg, updateAnswer]);

  return (
    <QuizCard
      title="Let's get your measurements"
      subtitle="We'll calculate your BMI and personalized targets"
      emoji="📏"
    >
      <div className="space-y-6">
        {/* Unit System Toggle */}
        <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              unitSystem === 'metric'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Metric (cm, kg)
          </button>
          <button
            type="button"
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              unitSystem === 'imperial'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Imperial (ft, lbs)
          </button>
        </div>

        {/* Height Input */}
        {unitSystem === 'metric' ? (
          <SliderInput
            label="Your Height"
            value={heightCm}
            min={140}
            max={220}
            unit="cm"
            onChange={setHeightCm}
          />
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Your Height</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Feet</label>
                <input
                  type="number"
                  min={4}
                  max={7}
                  value={heightFeet}
                  onChange={(e) => {
                    const feet = parseInt(e.target.value) || 4;
                    setHeightCm(feetInchesToCm(feet, heightInches));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Inches</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={heightInches}
                  onChange={(e) => {
                    const inches = parseInt(e.target.value) || 0;
                    setHeightCm(feetInchesToCm(heightFeet, inches));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {heightFeet}'{heightInches}" = {heightCm} cm
            </div>
          </div>
        )}

        {/* Current Weight Input */}
        {unitSystem === 'metric' ? (
          <SliderInput
            label="Current Weight"
            value={weightKg}
            min={40}
            max={200}
            unit="kg"
            onChange={setWeightKg}
          />
        ) : (
          <SliderInput
            label="Current Weight"
            value={weightLbs}
            min={88}
            max={440}
            unit="lbs"
            onChange={(lbs) => setWeightKg(lbsToKg(lbs))}
          />
        )}

        {bmi && <BMIIndicator bmi={bmi} />}

        {/* Target Weight Input */}
        {unitSystem === 'metric' ? (
          <SliderInput
            label="Target Weight"
            value={targetWeightKg}
            min={40}
            max={200}
            unit="kg"
            onChange={setTargetWeightKg}
          />
        ) : (
          <SliderInput
            label="Target Weight"
            value={targetWeightLbs}
            min={88}
            max={440}
            unit="lbs"
            onChange={(lbs) => setTargetWeightKg(lbsToKg(lbs))}
          />
        )}

        {targetWeightKg < weightKg && (
          <p className="text-sm text-green-600 text-center">
            Goal: Lose {unitSystem === 'metric' 
              ? `${(weightKg - targetWeightKg).toFixed(1)} kg` 
              : `${(weightLbs - targetWeightLbs).toFixed(1)} lbs`} 📉
          </p>
        )}
        {targetWeightKg > weightKg && (
          <p className="text-sm text-blue-600 text-center">
            Goal: Gain {unitSystem === 'metric' 
              ? `${(targetWeightKg - weightKg).toFixed(1)} kg` 
              : `${(targetWeightLbs - weightLbs).toFixed(1)} lbs`} 📈
          </p>
        )}
        {targetWeightKg === weightKg && (
          <p className="text-sm text-gray-600 text-center">
            Goal: Maintain current weight ⚖️
          </p>
        )}
      </div>
    </QuizCard>
  );
}
