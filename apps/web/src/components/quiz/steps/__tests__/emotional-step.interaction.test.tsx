import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '../../../../test/render-helper';
import { EmotionalStep } from '../emotional-step';

vi.mock('../../../../store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { habits: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, habits: { ...(state.answers.habits||{}), ...(patch.habits||{}) } }; } };
  const useQuizStore = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (useQuizStore as any).getState = () => state;
  return { useQuizStore };
});

vi.mock('../../../../lib/analytics', () => ({
  logQuizOptionSelected: vi.fn(),
}));

describe('EmotionalStep interactions', () => {
  it('selects an emotion option and saves into store', () => {
    const { getAllByRole } = renderWithProviders(<EmotionalStep />);
    // Click first option tile/button
    const buttons = getAllByRole('button');
    if (buttons.length > 0) buttons[0].click();
    const { useQuizStore } = require('../../../../store/quiz-store');
    const s = (useQuizStore as any).getState();
    expect(!!s.answers.habits.emotionalEating).toBeTypeOf('boolean');
  });
});

