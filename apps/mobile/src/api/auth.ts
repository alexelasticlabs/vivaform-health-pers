import type { AuthTokens as AuthTokensType, AuthUser as AuthUserType } from "@vivaform/shared";
type AuthTokens = AuthTokensType;
type AuthUser = AuthUserType;

import { request } from "./client";

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

export const login = (payload: LoginPayload) =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const register = (payload: RegisterPayload) =>
  request<LoginResponse>("/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const refresh = (refreshToken: string) =>
  request<LoginResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });

export const me = () => request<AuthUser>("/auth/me");