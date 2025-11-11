import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '../../../../test/render-helper';
import { HydrationStep } from '../hydration-step';

vi.mock('../../../../store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { habits: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, ...patch }; } };
  const useQuizStore = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (useQuizStore as any).getState = () => state;
  return { useQuizStore };
});

vi.mock('../../../../lib/analytics', () => ({
  logQuizSliderChanged: vi.fn(),
  logQuizToggleChanged: vi.fn(),
  logQuizOptionSelected: vi.fn(),
}));

describe('HydrationStep', () => {
  it('renders defaults and allows interactions', () => {
    const { getByLabelText, getByRole } = renderWithProviders(<HydrationStep />);
    const sliderLabel = getByLabelText(/How much water do you drink/i);
    expect(sliderLabel).toBeInTheDocument();
    const toggle = getByRole('button', { name: /Enable meal and hydration reminders/i });
    toggle.click();
    const { useQuizStore } = require('../../../../store/quiz-store');
    const s = (useQuizStore as any).getState();
    expect(!!s.answers.habits.wantReminders).toBe(true);
  });
});
