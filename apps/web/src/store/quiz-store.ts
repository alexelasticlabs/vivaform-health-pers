import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Quiz answer structure matching backend DTO
export interface QuizAnswers {
  diet?: {
    plan?: string;
  };
  body?: {
    height?: {
      cm?: number;
      ft?: number;
      in?: number;
    };
    weight?: {
      kg?: number;
      lb?: number;
    };
  };
  goals?: {
    type?: 'lose' | 'maintain' | 'gain';
    deltaKg?: number;
    etaMonths?: number;
  };
  habits?: {
    mealsPerDay?: number;
    snacks?: boolean;
    cookingTimeMinutes?: number;
    exerciseRegularly?: boolean;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional sections
}

interface QuizStore {
  // Client ID for tracking (generated once)
  clientId: string;
  
  // Quiz state
  currentStep: number;
  answers: QuizAnswers;
  isSubmitting: boolean;
  
  // Autosave state
  lastSaved: number | null;
  isSaving: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Update answers with autosave
  updateAnswers: (updates: Partial<QuizAnswers>) => void;
  
  // Manual save/load/clear
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearDraft: () => void;
  
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
  
  // Get draft for submission
  getDraft: () => { clientId: string; version: number; answers: QuizAnswers };
}

// Generate UUID v4
function generateClientId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get or create clientId from localStorage
function getOrCreateClientId(): string {
  const stored = localStorage.getItem('vivaform-quiz-clientId');
  if (stored) return stored;
  
  const newId = generateClientId();
  localStorage.setItem('vivaform-quiz-clientId', newId);
  return newId;
}

const initialState = {
  clientId: '',
  currentStep: 0,
  answers: {} as QuizAnswers,
  isSubmitting: false,
  lastSaved: null,
  isSaving: false,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      clientId: getOrCreateClientId(),

      setStep: (step: number) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({ currentStep: state.currentStep + 1 })),

      prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

      updateAnswers: (updates: Partial<QuizAnswers>) => {
        set((state) => ({
          answers: {
            ...state.answers,
            ...updates,
            // Deep merge for nested objects
            ...(updates.body && {
              body: { ...state.answers.body, ...updates.body },
            }),
            ...(updates.goals && {
              goals: { ...state.answers.goals, ...updates.goals },
            }),
            ...(updates.habits && {
              habits: { ...state.answers.habits, ...updates.habits },
            }),
            ...(updates.diet && {
              diet: { ...state.answers.diet, ...updates.diet },
            }),
          },
          lastSaved: Date.now(),
        }));
        
        // Autosave is handled by zustand persist middleware
      },

      saveToLocalStorage: () => {
        const state = get();
        const draft = {
          clientId: state.clientId,
          version: 1,
          answers: state.answers,
          currentStep: state.currentStep,
          savedAt: Date.now(),
        };
        localStorage.setItem(`quiz:draft:${state.clientId}`, JSON.stringify(draft));
        set({ lastSaved: Date.now() });
      },

      loadFromLocalStorage: () => {
        const state = get();
        const stored = localStorage.getItem(`quiz:draft:${state.clientId}`);
        if (stored) {
          try {
            const draft = JSON.parse(stored);
            set({
              answers: draft.answers || {},
              currentStep: draft.currentStep || 0,
              lastSaved: draft.savedAt || null,
            });
          } catch (e) {
            console.error('Failed to load quiz draft:', e);
          }
        }
      },

      clearDraft: () => {
        const state = get();
        localStorage.removeItem(`quiz:draft:${state.clientId}`);
        localStorage.removeItem('vivaform-quiz-clientId');
        set({
          ...initialState,
          clientId: generateClientId(),
        });
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      reset: () => {
        const newClientId = generateClientId();
        localStorage.setItem('vivaform-quiz-clientId', newClientId);
        set({
          ...initialState,
          clientId: newClientId,
        });
      },

      getDraft: () => {
        const state = get();
        return {
          clientId: state.clientId,
          version: 1,
          answers: state.answers,
        };
      },
    }),
    {
      name: 'vivaform-quiz-storage',
      partialize: (state) => ({
        clientId: state.clientId,
        currentStep: state.currentStep,
        answers: state.answers,
        lastSaved: state.lastSaved,
      }),
    },
  ),
);

// Debounced autosave hook
let autosaveTimeout: NodeJS.Timeout | null = null;

export function useQuizAutosave() {
  const store = useQuizStore();
  
  const debouncedSave = () => {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    
    autosaveTimeout = setTimeout(() => {
      store.saveToLocalStorage();
    }, 500); // 500ms debounce
  };

  return { debouncedSave };
}

// Calculate BMI locally for preview
export function calculateBMI(answers: QuizAnswers): { bmi: number; category: string } | null {
  const height = answers.body?.height;
  const weight = answers.body?.weight;
  
  if (!height || !weight) return null;
  
  // Normalize to cm and kg
  let heightCm: number;
  if (height.cm) {
    heightCm = height.cm;
  } else if (height.ft !== undefined) {
    const totalInches = (height.ft * 12) + (height.in || 0);
    heightCm = totalInches * 2.54;
  } else {
    return null;
  }
  
  let weightKg: number;
  if (weight.kg) {
    weightKg = weight.kg;
  } else if (weight.lb) {
    weightKg = weight.lb * 0.453592;
  } else {
    return null;
  }
  
  // Calculate BMI
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  
  let category: string;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal 👌🏼';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  
  return { bmi, category };
}
