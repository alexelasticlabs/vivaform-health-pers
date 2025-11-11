import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useUserStore, useOfflineStore } from "@/store";
import type { AuthTokens, AuthUser } from "@vivaform/shared";

const baseURL = import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL ?? "https://localhost:4000");

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
  (response) => {
    // Если ранее были офлайн — при первом успешном ответе скрываем баннер
    const { offline, setOffline } = useOfflineStore.getState();
    if (offline) setOffline(false);
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    // Network / CORS / backend down
    if (error.code === 'ERR_NETWORK' || (error.message && /Network Error|ECONNREFUSED|ENOTFOUND/i.test(error.message))) {
      useOfflineStore.getState().setOffline(true);
    }

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
          setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
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