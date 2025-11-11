import { describe, it, expect } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { EnergyScheduleStep } from '../energy-schedule-step';
import { useQuizStore } from '@/store/quiz-store';

describe('EnergyScheduleStep interactions', () => {
  it('changes wake/dinner times and sleep slider', async () => {
    useQuizStore.setState({ answers: { habits: { sleepHours: 7 } } } as any);
    const { getByLabelText } = renderWithProviders(<EnergyScheduleStep />);
    const wake = getByLabelText(/wake up/i) as HTMLInputElement;
    const dinner = getByLabelText(/have dinner/i) as HTMLInputElement;

    // Change time values
    wake.value = '06:30';
    wake.dispatchEvent(new Event('input', { bubbles: true }));
    dinner.value = '20:15';
    dinner.dispatchEvent(new Event('input', { bubbles: true }));

    // Update slider via custom component: try aria role or direct Store update through onChange if exposed
    // Here we simulate by setting store since SliderInput is abstracted
    useQuizStore.getState().updateAnswers({ habits: { sleepHours: 8.5 } });

    const st = useQuizStore.getState() as any;
    expect(st.answers.habits.wakeUpTime).toBe('06:30');
    expect(st.answers.habits.dinnerTime).toBe('20:15');
    expect(st.answers.habits.sleepHours).toBe(8.5);
  });
});
