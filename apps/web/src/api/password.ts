import { apiClient } from './client';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post('/auth/reset-password', data);
  return response.data;
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  const response = await apiClient.get(`/auth/verify-email?token=${token}`);
  return response.data;
}
