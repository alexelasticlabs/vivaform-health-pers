import type { AuthTokens, AuthUser } from "@vivaform/shared";

import { apiClient } from "./client";

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export type LoginResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type RegisterResponse = LoginResponse;

export type RefreshResponse = LoginResponse | AuthTokens;

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
  return data;
};

export const refreshSession = async () => {
  const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", {});
  if ((data as any).tokens && (data as any).user) {
    return data as LoginResponse;
  }
  // backend может вернуть только { accessToken, refreshToken }
  return { user: (null as unknown as AuthUser), tokens: data as AuthTokens } as unknown as LoginResponse;
};

export const fetchCurrentUser = async () => {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
};