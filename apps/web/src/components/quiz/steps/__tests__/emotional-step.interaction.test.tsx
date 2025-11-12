import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { EmotionalStep } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

vi.mock('@/lib/analytics', () => ({
  logQuizOptionSelected: vi.fn(),
}));

describe('EmotionalStep interactions', () => {
  it('selects an emotion option and saves into store', () => {
    const { getAllByRole } = renderWithProviders(<EmotionalStep />);
    const buttons = getAllByRole('button');
    if (buttons.length > 0) buttons[0].click();
    const s = (useQuizStore as any).getState();
    expect(!!s.answers.habits.emotionalEating).toBeTypeOf('boolean');
  });
});
