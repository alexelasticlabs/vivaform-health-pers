import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { EnergyScheduleStep } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

vi.mock('@/store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { habits: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, ...patch }; } };
  const hook = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (hook as any).getState = () => state;
  return { useQuizStore: hook };
});

vi.mock('@/lib/analytics', () => ({
  logQuizSliderChanged: vi.fn(),
  logQuizToggleChanged: vi.fn(),
}));

describe('EnergyScheduleStep', () => {
  it('renders defaults and updates answers on interactions', () => {
    const { getByTestId } = renderWithProviders(<EnergyScheduleStep />);
    const timeWake = getByTestId('wake-time') as HTMLInputElement;
    expect(timeWake.value).toBe('07:00');

    const toggle = document.querySelector('button[role="switch"], button') as HTMLButtonElement;
    toggle.click();
    const s = (useQuizStore as any).getState();
    expect(!!s.answers.habits.exerciseRegularly).toBe(true);
  });
});
