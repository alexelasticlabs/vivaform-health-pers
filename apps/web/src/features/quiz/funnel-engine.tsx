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
  return step.fields.every((field) => {
    const value = (answers as any)[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });
}

export function calcQuizProgressPercent(stepIndex: number, answers: QuizAnswers): number {
  const visible = getVisibleQuizSteps(answers);
  return calcProgressPercent(stepIndex, visible.length);
}
