import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizAnswersModel } from '@/features/quiz/quiz-config';
import { derivePlanType } from '@/features/quiz/quiz-config';

// Safe storage helpers
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

// Quiz answer structure aligned with the lean 12-step funnel
export interface QuizAnswers extends QuizAnswersModel {
  [key: string]: unknown; // Allow API compatibility
}

const NON_SENSITIVE_ANSWER_FIELDS: (keyof QuizAnswers)[] = [
  'primary_goal',
  'gender',
  'activity_level',
  'weekly_rhythm',
  'sleep_quality',
  'weight_loss_rebound',
  'last_ideal_weight_timing',
  'food_likes',
  'eating_habits',
  'protein_preferences',
  'food_allergies',
  'food_intolerances',
  'diet_preference',
  'diet_safety_override',
  'cooking_style',
  'cooking_confidence',
  'cooking_skill_tags',
  'budget_level',
  'clothing_size_current',
  'clothing_size_goal',
  'final_plan_type',
  'answersVersion'
];

const extractSafeAnswers = (answers: QuizAnswers | undefined): Partial<QuizAnswers> => {
  if (!answers) return {};
  return NON_SENSITIVE_ANSWER_FIELDS.reduce<Partial<QuizAnswers>>((acc, field) => {
    const value = answers[field];
    if (value !== undefined) {
      (acc as any)[field] = value;
    }
    return acc;
  }, {});
};

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

  // Gamification state
  currentPhase: number; // 1-4
  badges: string[]; // Badge IDs earned
  timeSpentPerStep: Record<number, number>; // milliseconds
  stepStartTime: number | null;

  // Engagement tracking
  backNavigationCount: number;
  helpViewCount: number;

  // Predictions
  completionLikelihood: number; // 0-100

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Gamification actions
  unlockBadge: (badgeId: string) => void;
  recordStepTime: () => void;

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
    if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) {
      const c: Crypto = (globalThis as any).crypto;
      if (typeof (c as any).randomUUID === 'function') {
        return (c as any).randomUUID();
      }
      if (typeof c.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        c.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
      }
    }
  } catch {}
  // Ultimate fallback (non-crypto): timestamp-based stable id
  const now = Date.now().toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${now.slice(-12)}`;
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
  currentPhase: 1,
  badges: [] as string[],
  timeSpentPerStep: {} as Record<number, number>,
  stepStartTime: null as number | null,
  backNavigationCount: 0,
  helpViewCount: 0,
  completionLikelihood: 50,
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
        set((state) => {
          const nextAnswers: QuizAnswers = {
            ...state.answers,
            ...updates,
          };
          // normalize dual units
          if (updates.raw_height_ft !== undefined || updates.raw_height_in !== undefined) {
            const ft = updates.raw_height_ft ?? state.answers.raw_height_ft ?? 0;
            const inch = updates.raw_height_in ?? state.answers.raw_height_in ?? 0;
            nextAnswers.height_cm = Math.round(((ft * 12) + inch) * 2.54);
          }
          if (updates.raw_weight_lbs !== undefined) {
            const lbs = updates.raw_weight_lbs ?? state.answers.raw_weight_lbs ?? 0;
            nextAnswers.weight_kg = Math.round((lbs * 0.453592) * 10) / 10;
          }
          const planAffinityFields: (keyof QuizAnswers)[] = [
            'primary_goal',
            'food_likes',
            'health_conditions',
            'cooking_style',
            'diet_preference',
            'diet_safety_override',
          ];
          if (planAffinityFields.some((field) => field in updates)) {
            nextAnswers.final_plan_type = derivePlanType(nextAnswers);
          }
          return {
            answers: nextAnswers,
            lastSaved: Date.now(),
          };
        });

        // Autosave is handled by zustand persist middleware
      },

      mergeServerAnswers: (server: QuizAnswers) => {
        const state = get();
        const local = state.answers;
        const merged: QuizAnswers = {
          ...server,
          ...local,
        };
        set({ answers: merged });
      },

      saveToLocalStorage: () => {
        const state = get();
        const draft = {
          clientId: state.clientId,
          version: 1,
          answers: extractSafeAnswers(state.answers),
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

      // Gamification methods
      unlockBadge: (badgeId: string) => {
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId]
        }));
      },

      recordStepTime: () => {
        const state = get();
        if (state.stepStartTime) {
          const timeSpent = Date.now() - state.stepStartTime;
          set((prevState) => ({
            timeSpentPerStep: {
              ...prevState.timeSpentPerStep,
              [prevState.currentStep]: timeSpent
            },
            stepStartTime: Date.now() // Reset for next step
          }));
        } else {
          set({ stepStartTime: Date.now() });
        }
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
        answers: extractSafeAnswers(state.answers),
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
  const heightCm = answers.height_cm;
  const weightKg = answers.weight_kg;
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  let category: string;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { bmi, category };
}
