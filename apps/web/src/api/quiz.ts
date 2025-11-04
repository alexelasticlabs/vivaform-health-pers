import { apiClient } from './client';
import axios from 'axios';

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

export interface SaveQuizPreviewRequest {
  clientId: string;
  version: number;
  answers: QuizAnswers;
}

export interface SaveQuizPreviewResponse {
  ok: boolean;
  savedAt: string;
}

export interface GetQuizPreviewResponse {
  clientId: string;
  version: number;
  answers: QuizAnswers;
  savedAt?: string;
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
 * Safe getter: returns null when profile does not exist (404), throws otherwise
 */
export async function tryGetQuizProfile(): Promise<QuizProfile | null> {
  try {
    const response = await apiClient.get<QuizProfile>('/quiz/profile');
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Update quiz profile (partial update)
 */
export async function updateQuizProfile(data: UpdateQuizProfileRequest): Promise<SubmitQuizResponse> {
  const response = await apiClient.patch<SubmitQuizResponse>('/quiz/profile', data);
  return response.data;
}

/**
 * Debounced preview autosave — authenticated users only. Safe to call; errors are non-fatal.
 */
export async function saveQuizPreview(data: SaveQuizPreviewRequest): Promise<SaveQuizPreviewResponse> {
  const response = await apiClient.post<SaveQuizPreviewResponse>('/quiz/preview', data);
  return response.data;
}

/**
 * Fetch saved preview for authenticated user (if exists).
 */
export async function getQuizPreview(): Promise<GetQuizPreviewResponse> {
  const response = await apiClient.get<GetQuizPreviewResponse>('/quiz/preview');
  return response.data;
}
