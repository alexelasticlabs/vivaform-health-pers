import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useUserStore } from "../store/user-store";
import type { AuthTokens, AuthUser } from "@vivaform/shared";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().tokens?.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<{ user: AuthUser; tokens: AuthTokens }> | null = null;

const refreshTokens = async (refreshToken: string) => {
  const response = await axios.post<{ user: AuthUser; tokens: AuthTokens }>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { withCredentials: true }
  );
  return response.data;
};

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

type ApiErrorPayload = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
      useUserStore.getState().logout();
      return Promise.reject(error);
    }

    const { tokens, setAuth, logout } = useUserStore.getState();
    if (!tokens?.refreshToken) {
      logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens(tokens.refreshToken).then((data) => {
          setAuth(data.user, data.tokens);
          return data;
        }).finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      return apiClient(originalRequest);
    } catch (refreshError) {
      useUserStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }
);