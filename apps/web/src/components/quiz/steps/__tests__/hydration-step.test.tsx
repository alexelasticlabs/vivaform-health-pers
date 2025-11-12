import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { HydrationStep } from '@/components/quiz';
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
  logQuizOptionSelected: vi.fn(),
}));

describe('HydrationStep', () => {
  it('renders defaults and allows interactions', () => {
    renderWithProviders(<HydrationStep />);
    const range = document.querySelector('input[type="range"]') as HTMLInputElement;
    expect(range).toBeTruthy();
    const toggle = document.querySelector('button[role="switch"], button') as HTMLButtonElement;
    toggle.click();
    const s = (useQuizStore as any).getState();
    expect(!!s.answers.habits.wantReminders).toBe(true);
  });
});
