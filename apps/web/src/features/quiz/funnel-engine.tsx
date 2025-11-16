import type { QuizAnswers } from '../../store/quiz-store';
import { QUIZ_STEPS, getVisibleQuizSteps, calcProgressPercent } from './quiz-config';

export interface FunnelStepConfig {
  id: string;
  group: string;
  uiType: string;
}

export const FUNNEL_STEPS: FunnelStepConfig[] = QUIZ_STEPS.map((step) => ({
  id: step.id,
  group: step.group,
  uiType: step.uiType,
}));

export function canProceed(stepIndex: number, answers: QuizAnswers): boolean {
  const visible = getVisibleQuizSteps(answers);
  const step = visible[stepIndex];
  if (!step) return true;
  // Строгая валидация для базового шага профиля: имя не обязательно,
  // но возраст и базовые антропометрические данные должны быть указаны.
  if (step.id === 'basic_profile') {
    const age = (answers as any).age_years;
    const heightCm = (answers as any).height_cm;
    const weightKg = (answers as any).weight_kg;
    const rawHeightFt = (answers as any).raw_height_ft;
    const rawHeightIn = (answers as any).raw_height_in;
    const rawWeightLbs = (answers as any).raw_weight_lbs;

    const hasValidAge = typeof age === 'number' && age >= 18 && age <= 90;
    const hasMetricHeightWeight = typeof heightCm === 'number' && heightCm >= 120 && heightCm <= 230 &&
      typeof weightKg === 'number' && weightKg >= 35 && weightKg <= 250;
    const hasImperialHeightWeight = typeof rawHeightFt === 'number' && rawHeightFt >= 4 && rawHeightFt <= 7 &&
      typeof rawHeightIn === 'number' && rawHeightIn >= 0 && rawHeightIn <= 11 &&
      typeof rawWeightLbs === 'number' && rawWeightLbs >= 70 && rawWeightLbs <= 600;

    return hasValidAge && (hasMetricHeightWeight || hasImperialHeightWeight);
  }
  return step.fields.every((field) => {
    const value = (answers as any)[field];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== undefined && value !== null && value !== '';
  });
}

export function calcQuizProgressPercent(stepIndex: number, answers: QuizAnswers): number {
  const visible = getVisibleQuizSteps(answers);
  return calcProgressPercent(stepIndex, visible.length);
}
