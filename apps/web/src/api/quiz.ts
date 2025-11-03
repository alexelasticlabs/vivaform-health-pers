import type {
  SubmitQuizPayload,
  SubmitQuizResponse,
} from '@vivaform/shared';
import { apiClient } from './client';

/**
 * Submit quiz for anonymous users (preview mode)
 * This endpoint doesn't require authentication
 */
export async function submitQuiz(
  payload: SubmitQuizPayload,
): Promise<SubmitQuizResponse> {
  const response = await apiClient.post<SubmitQuizResponse>(
    '/quiz/preview',
    payload,
  );
  return response.data;
}

/**
 * Submit quiz for authenticated users (saves to profile)
 */
export async function submitQuizAuthenticated(
  payload: SubmitQuizPayload,
): Promise<SubmitQuizResponse> {
  const response = await apiClient.post<SubmitQuizResponse>(
    '/quiz/submit',
    payload,
  );
  return response.data;
}
