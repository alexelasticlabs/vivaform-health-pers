import { apiClient } from './client';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RequestTempPasswordRequest {
  email: string;
}

export interface ForceChangePasswordRequest {
  newPassword: string;
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

export async function requestTempPassword(data: RequestTempPasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post('/auth/request-temp-password', data);
  return response.data;
}

export async function forceChangePassword(data: ForceChangePasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post('/auth/force-change-password', data);
  return response.data;
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  const response = await apiClient.get(`/auth/verify-email?token=${token}`);
  return response.data;
}
