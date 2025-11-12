import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { PreferencesStep } from '@/components/quiz';

vi.mock('../../../../store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { preferences: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, ...patch }; } };
  const useQuizStore = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (useQuizStore as any).getState = () => state;
  return { useQuizStore };
});

vi.mock('../../../../lib/analytics', () => ({
  logQuizOptionSelected: vi.fn(),
}));

describe('PreferencesStep', () => {
  it('snapshot default render', () => {
    const { container } = renderWithProviders(<PreferencesStep />);
    expect(container).toMatchSnapshot();
  });
});
