import { useState, useEffect } from 'react';
import { QuizCard, SliderInput, BMIIndicator } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

type UnitSystem = 'metric' | 'imperial';

export function BodyMetricsStep() {
  const { answers, updateAnswers } = useQuizStore();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [heightCm, setHeightCm] = useState(answers.body?.height?.cm || 170);
  const [weightKg, setWeightKg] = useState(answers.body?.weight?.kg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState(
    answers.goals?.deltaKg ? (answers.body?.weight?.kg || 70) - answers.goals.deltaKg : 65,
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
    updateAnswers({ body: { height: { cm: heightCm } } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightCm]);

  useEffect(() => {
    updateAnswers({ body: { weight: { kg: weightKg } } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightKg]);

  useEffect(() => {
    const deltaKg = weightKg - targetWeightKg;
    updateAnswers({ goals: { deltaKg, type: deltaKg > 0 ? 'lose' : deltaKg < 0 ? 'gain' : 'maintain' } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetWeightKg, weightKg]);

  return (
    <QuizCard
      title="Let's get your measurements"
      subtitle="We'll calculate your BMI and personalized targets"
      emoji="📏"
    >
      <div className="space-y-6">
        {/* Unit System Toggle */}
        <div className="flex justify-center gap-2 rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              unitSystem === 'metric'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Metric (cm, kg)
          </button>
          <button
            type="button"
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              unitSystem === 'imperial'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
            <label className="text-sm font-medium text-foreground/80">Your Height</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Feet</label>
                <input
                  type="number"
                  min={4}
                  max={7}
                  value={heightFeet}
                  onChange={(e) => {
                    const feet = parseInt(e.target.value) || 4;
                    setHeightCm(feetInchesToCm(feet, heightInches));
                  }}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Inches</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={heightInches}
                  onChange={(e) => {
                    const inches = parseInt(e.target.value) || 0;
                    setHeightCm(feetInchesToCm(heightFeet, inches));
                  }}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-2"
                />
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
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

        {typeof bmi === 'number' && <BMIIndicator bmi={bmi} />}

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
          <p className="text-center text-sm text-emerald-700 dark:text-emerald-300">
            Goal: Lose {unitSystem === 'metric' 
              ? `${(weightKg - targetWeightKg).toFixed(1)} kg` 
              : `${(weightLbs - targetWeightLbs).toFixed(1)} lbs`} 📉
          </p>
        )}
        {targetWeightKg > weightKg && (
          <p className="text-center text-sm text-sky-700 dark:text-sky-300">
            Goal: Gain {unitSystem === 'metric' 
              ? `${(targetWeightKg - weightKg).toFixed(1)} kg` 
              : `${(targetWeightLbs - weightLbs).toFixed(1)} lbs`} 📈
          </p>
        )}
        {targetWeightKg === weightKg && (
          <p className="text-center text-sm text-muted-foreground">
            Goal: Maintain current weight ⚖️
          </p>
        )}
      </div>
    </QuizCard>
  );
}
