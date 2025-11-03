import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizAnswers, QuizResult } from '@vivaform/shared';

interface QuizStore {
  currentStep: number;
  answers: QuizAnswers;
  result: QuizResult | null;
  isSubmitting: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateAnswer: <K extends keyof QuizAnswers>(
    key: K,
    value: QuizAnswers[K],
  ) => void;
  setResult: (result: QuizResult) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  answers: {} as QuizAnswers,
  result: null,
  isSubmitting: false,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step: number) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 30) })),

      prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

      updateAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),

      setResult: (result) => set({ result }),

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      reset: () => set(initialState),
    }),
    {
      name: 'vivaform-quiz-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        answers: state.answers,
        result: state.result,
      }),
    },
  ),
);
