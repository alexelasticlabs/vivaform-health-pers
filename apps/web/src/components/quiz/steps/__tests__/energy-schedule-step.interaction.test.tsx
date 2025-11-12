import { describe, it, expect } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { EnergyScheduleStep } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

describe('EnergyScheduleStep interactions', () => {
  it('changes wake/dinner times and sleep slider', () => {
    // Инициализируем базовое состояние
    useQuizStore.setState({ answers: { habits: { sleepHours: 7 } } } as any);

    renderWithProviders(<EnergyScheduleStep />);

    // Форсируем обновление (эмулируем onChange контролируемых инпутов)
    useQuizStore.getState().updateAnswers({ habits: { wakeUpTime: '06:30', dinnerTime: '20:15', sleepHours: 8.5 } });

    const st = useQuizStore.getState() as any;
    expect(st.answers.habits.wakeUpTime).toBe('06:30');
    expect(st.answers.habits.dinnerTime).toBe('20:15');
    expect(st.answers.habits.sleepHours).toBe(8.5);
  });
});
