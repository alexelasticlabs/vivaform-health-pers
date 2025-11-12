import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Безопасные хелперы доступа к Storage
const safeStorage = {
  getItem(key: string): string | null {
    try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; } catch { return null; }
  },
  setItem(key: string, value: string) {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  removeItem(key: string) {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); } catch { /* ignore */ }
  }
};

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
  // Merge server answers (prefer local values)
  mergeServerAnswers: (server: QuizAnswers) => void;
  
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
  
  // Get draft for submission
  getDraft: () => { clientId: string; version: number; answers: QuizAnswers };
}

// Generate UUID v4
function generateClientId(): string {
  try {
    // Prefer secure random UUID when available
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
  } catch {}
  // Ultimate fallback (non-crypto): timestamp-based stable id
  const now = Date.now().toString(16).padStart(12, '0');
  const id = `00000000-0000-4000-8000-${now.slice(-12)}`;
  return id;
}

// Get or create clientId from localStorage
function getOrCreateClientId(): string {
  const stored = safeStorage.getItem('vivaform-quiz-clientId');
  if (stored) return stored;
  
  const newId = generateClientId();
  safeStorage.setItem('vivaform-quiz-clientId', newId);
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
      clientId: (typeof window === 'undefined') ? '' : getOrCreateClientId(),

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

      mergeServerAnswers: (server: QuizAnswers) => {
        const state = get();
        const local = state.answers;
        const merged: QuizAnswers = {
          ...server,
          ...local,
          diet: { ...(server.diet ?? {}), ...(local.diet ?? {}) },
          body: {
            ...(server.body ?? {}),
            ...(local.body ?? {}),
            height: { ...(server.body?.height ?? {}), ...(local.body?.height ?? {}) },
            weight: { ...(server.body?.weight ?? {}), ...(local.body?.weight ?? {}) },
          },
          goals: { ...(server.goals ?? {}), ...(local.goals ?? {}) },
          habits: { ...(server.habits ?? {}), ...(local.habits ?? {}) },
        };
        set({ answers: merged });
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
        safeStorage.setItem(`quiz:draft:${state.clientId}`, JSON.stringify(draft));
        set({ lastSaved: Date.now() });
      },

      loadFromLocalStorage: () => {
        const state = get();
        const stored = safeStorage.getItem(`quiz:draft:${state.clientId}`);
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
        safeStorage.removeItem(`quiz:draft:${state.clientId}`);
        safeStorage.removeItem('vivaform-quiz-clientId');
        set({
          ...initialState,
          clientId: generateClientId(),
        });
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      reset: () => {
        const newClientId = generateClientId();
        safeStorage.setItem('vivaform-quiz-clientId', newClientId);
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
