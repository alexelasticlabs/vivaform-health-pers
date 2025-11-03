import { apiClient } from './client';

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
  [key: string]: any;
}

export interface SubmitQuizRequest {
  clientId: string;
  version: number;
  answers: QuizAnswers;
  overwrite?: boolean;
}

export interface SubmitQuizResponse {
  userId: string;
  stored: boolean;
  profile: {
    dietPlan?: string;
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    goalType?: string;
    goalDeltaKg?: number;
    etaMonths?: number;
    updatedAt: string;
  };
}

export interface QuizProfile {
  id: string;
  version: number;
  answers: QuizAnswers;
  dietPlan?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  goalType?: string;
  goalDeltaKg?: number;
  etaMonths?: number;
  mealsPerDay?: number;
  cookingTimeMinutes?: number;
  exerciseRegularly?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateQuizProfileRequest {
  answers?: Partial<QuizAnswers>;
}

/**
 * Submit quiz profile (creates or updates) - authenticated
 */
export async function submitQuiz(data: SubmitQuizRequest): Promise<SubmitQuizResponse> {
  const response = await apiClient.post<SubmitQuizResponse>('/quiz/submit', data);
  return response.data;
}

/**
 * Get user's quiz profile
 */
export async function getQuizProfile(): Promise<QuizProfile> {
  const response = await apiClient.get<QuizProfile>('/quiz/profile');
  return response.data;
}

/**
 * Update quiz profile (partial update)
 */
export async function updateQuizProfile(data: UpdateQuizProfileRequest): Promise<SubmitQuizResponse> {
  const response = await apiClient.patch<SubmitQuizResponse>('/quiz/profile', data);
  return response.data;
}
