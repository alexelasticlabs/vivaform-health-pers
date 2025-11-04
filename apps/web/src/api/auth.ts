import type { AuthTokens, AuthUser } from "@vivaform/shared";

import { apiClient } from "./client";

export type LoginPayload = {
  email: string;
  password: string;
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

export type RegisterResponse = {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
};

export type RefreshResponse = LoginResponse;

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post<RegisterResponse>("/users", payload);
  return data;
};

export const refreshSession = async (refreshToken: string) => {
  const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken });
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
};