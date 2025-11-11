import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '../../../../test/render-helper';
import { EnergyScheduleStep } from '../energy-schedule-step';

vi.mock('../../../../store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { habits: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, ...patch }; } };
  const useQuizStore = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (useQuizStore as any).getState = () => state;
  return { useQuizStore };
});

vi.mock('../../../../lib/analytics', () => ({
  logQuizSliderChanged: vi.fn(),
  logQuizToggleChanged: vi.fn(),
}));

describe('EnergyScheduleStep', () => {
  it('renders defaults and updates answers on interactions', () => {
    const { getByLabelText } = renderWithProviders(<EnergyScheduleStep />);
    const sleepLabel = getByLabelText(/How many hours do you sleep per day/i) as HTMLLabelElement;
    expect(sleepLabel).toBeInTheDocument();

    const timeWake = document.querySelector('input[type="time"]') as HTMLInputElement;
    expect(timeWake.value).toBe('07:00');

    const toggle = document.querySelector('button[role="switch"], button') as HTMLButtonElement;
    toggle.click();
    const { useQuizStore } = require('../../../../store/quiz-store');
    const s = (useQuizStore as any).getState();
    expect(!!s.answers.habits.exerciseRegularly).toBe(true);
  });
});
