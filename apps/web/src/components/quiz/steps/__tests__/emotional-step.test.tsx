import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '../../../../test/render-helper';
import { EmotionalStep } from '../emotional-step';

vi.mock('../../../../store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { habits: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, ...patch }; } };
  const useQuizStore = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (useQuizStore as any).getState = () => state;
  return { useQuizStore };
});

vi.mock('../../../../lib/analytics', () => ({
  logQuizOptionSelected: vi.fn(),
}));

describe('EmotionalStep', () => {
  it('renders and matches snapshot', () => {
    const { container } = renderWithProviders(<EmotionalStep />);
    expect(container).toMatchSnapshot();
  });
});

