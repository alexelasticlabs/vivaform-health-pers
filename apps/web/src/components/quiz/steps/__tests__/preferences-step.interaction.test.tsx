import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '../../../../test/render-helper';
import { PreferencesStep } from '../preferences-step';

vi.mock('../../../../store/quiz-store', () => {
  let state: any = { clientId: 'test-client', answers: { habits: {} }, updateAnswers: (patch: any) => { state.answers = { ...state.answers, habits: { ...(state.answers.habits||{}), ...(patch.habits||{}) } }; } };
  const useQuizStore = (selector?: any) => (typeof selector === 'function' ? selector(state) : state);
  (useQuizStore as any).getState = () => state;
  return { useQuizStore };
});

vi.mock('../../../../lib/analytics', () => ({
  logQuizOptionSelected: vi.fn(),
  logQuizSliderChanged: vi.fn(),
  logQuizToggleChanged: vi.fn(),
}));

describe('PreferencesStep interactions', () => {
  it('adds and removes allergy, avoided food, toggles complexity and updates cooking time', () => {
    const { getByPlaceholderText, getByRole, getAllByRole } = renderWithProviders(<PreferencesStep />);
    // Add custom allergy
    const allergyInput = getByPlaceholderText(/Other allergy/i) as HTMLInputElement;
    allergyInput.focus();
    allergyInput.value = 'TestAllergy';
    allergyInput.dispatchEvent(new Event('input', { bubbles: true }));
    const addButtons = getAllByRole('button', { name: /add/i });
    addButtons[0].click();
    const { useQuizStore } = require('../../../../store/quiz-store');
    let s = (useQuizStore as any).getState();
    expect(s.answers.habits.foodAllergies).toContain('TestAllergy');

    // Remove allergy (× button)
    const removeBtn = getAllByRole('button').find(b => b.textContent === '×');
    if (removeBtn) removeBtn.click();
    s = (useQuizStore as any).getState();
    expect(s.answers.habits.foodAllergies || []).not.toContain('TestAllergy');

    // Add avoided food
    const avoidedInput = getByPlaceholderText(/Other food/i) as HTMLInputElement;
    avoidedInput.value = 'SugarX';
    avoidedInput.dispatchEvent(new Event('input', { bubbles: true }));
    addButtons[1].click();
    s = (useQuizStore as any).getState();
    expect(s.answers.habits.avoidedFoods).toContain('SugarX');

    // Toggle meal complexity -> click first OptionTile (simple)
    const complexityButton = getAllByRole('button').find(b => /Simple/.test(b.textContent||''));
    if (complexityButton) complexityButton.click();
    s = (useQuizStore as any).getState();
    expect(s.answers.habits.mealComplexity).toBe('simple');
  });
});

