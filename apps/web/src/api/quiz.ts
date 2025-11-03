import type {
  SubmitQuizPayload,
  SubmitQuizResponse,
} from '@vivaform/shared';
import { apiClient } from './client';

export async function submitQuiz(
  payload: SubmitQuizPayload,
): Promise<SubmitQuizResponse> {
  const response = await apiClient.post<SubmitQuizResponse>(
    '/quiz/submit',
    payload,
  );
  return response.data;
}
