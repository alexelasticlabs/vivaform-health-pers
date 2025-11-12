import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';
import renderWithProviders from '@/test/render-helper';
import { PreferencesStep } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

describe('PreferencesStep interactions', () => {
  it('toggles built-in allergy & avoided food, sets meal complexity', async () => {
    useQuizStore.setState({ answers: { habits: { foodAllergies: [], avoidedFoods: [] } } } as any);

    const { getByRole, getAllByRole } = renderWithProviders(<PreferencesStep />);

    // Toggle allergy (Gluten)
    const glutenBtn = getByRole('button', { name: /Allergy: Gluten/i });
    glutenBtn.click();
    await waitFor(() => {
      const s = useQuizStore.getState() as any;
      expect(s.answers.habits.foodAllergies).toContain('Gluten');
    });

    // Toggle avoided food (Sugar)
    const sugarBtn = getByRole('button', { name: /Avoid: Sugar/i });
    sugarBtn.click();
    await waitFor(() => {
      const s = useQuizStore.getState() as any;
      expect(s.answers.habits.avoidedFoods).toContain('Sugar');
    });

    // Set meal complexity to Simple via OptionTile (title contains Simple)
    const complexityButton = getAllByRole('button').find(b => /Simple \(5-15 min\)/.test(b.textContent||''));
    if (complexityButton) complexityButton.click();
    await waitFor(() => {
      const s = useQuizStore.getState() as any;
      expect(s.answers.habits.mealComplexity).toBe('simple');
    });

    // Remove allergy (click × on the rendered pill)
    const removeAllergyButton = getAllByRole('button').find(b => b.textContent === '×');
    if (removeAllergyButton) removeAllergyButton.click();
    await waitFor(() => {
      const s = useQuizStore.getState() as any;
      expect(s.answers.habits.foodAllergies || []).not.toContain('Gluten');
    });
  });
});
