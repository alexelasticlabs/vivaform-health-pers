import { useUserStore } from '@/store/user-store';
import { useQuizStore } from '@/store/quiz-store';

export function initUserPremium(profilePatch?: Partial<ReturnType<typeof useUserStore.getState>['profile']>) {
  useUserStore.setState({ profile: { id: 'u_test', tier: 'PREMIUM', ...(profilePatch || {}) } } as any);
}

export function initQuizHabitsState(habitsPatch?: any) {
  const current = useQuizStore.getState().answers?.habits || {};
  useQuizStore.setState({ answers: { habits: { ...current, ...(habitsPatch || {}) } } } as any);
}

export function getQuizState() {
  return useQuizStore.getState() as any;
}

