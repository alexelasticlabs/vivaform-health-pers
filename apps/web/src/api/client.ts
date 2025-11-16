import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from 'sonner';

import { useUserStore, useOfflineStore } from "@/store";
import type { AuthTokens, AuthUser } from "@vivaform/shared";

const baseURL = import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL;
if (!import.meta.env.DEV && !baseURL) {
  // Жёсткий фейл на рантайме, но сборка отловит раньше
  throw new Error("VITE_API_URL is required in production build");
}

const CSRF_COOKIE_NAME = "csrfToken";
const METHODS_REQUIRING_CSRF = new Set(["post", "put", "patch", "delete"]);
let csrfInitPromise: Promise<void> | null = null;

function readCsrfCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfTokenCookie() {
  if (typeof document === "undefined") {
    return;
  }
  if (readCsrfCookie()) {
    return;
  }
  if (!csrfInitPromise) {
    csrfInitPromise = axios
      .get(`${baseURL}/auth/csrf-token`, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        csrfInitPromise = null;
      });
  }
  await csrfInitPromise;
}

function needsCsrfProtection(method?: string) {
  if (!method) return false;
  return METHODS_REQUIRING_CSRF.has(method.toLowerCase());
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true
});

apiClient.interceptors.request.use(async (config) => {
  const nextConfig = config;
  nextConfig.headers = nextConfig.headers ?? {};

  const token = useUserStore.getState().accessToken;
  if (token) {
    (nextConfig.headers as any).Authorization = `Bearer ${token}`;
  }

  (nextConfig.headers as any)["X-Requested-With"] = "XMLHttpRequest";

  if (needsCsrfProtection(nextConfig.method)) {
    await ensureCsrfTokenCookie();
    const csrfToken = readCsrfCookie();
    if (csrfToken) {
      (nextConfig.headers as any)["X-CSRF-Token"] = csrfToken;
    }
  }

  return nextConfig;
});

// Допускаем, что refresh может вернуть только токены без user
type RefreshResponse = { tokens: AuthTokens; user?: AuthUser };
let refreshPromise: Promise<RefreshResponse> | null = null;

const refreshTokens = async () => {
  const response = await axios.post<RefreshResponse>(
    `${baseURL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

// Удалены динамические/ручные моки и адаптеры

apiClient.interceptors.response.use(
  (response) => {
    // Если ранее были офлайн — при первом успешном ответе скрываем баннер
    const { offline, setOffline, backendDown, clearServerErrors } = useOfflineStore.getState();
    if (offline) setOffline(false);
    if (backendDown) clearServerErrors();
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const status = error.response?.status;
    const isNetwork = !error.response;
    const is5xx = !!status && status >= 500 && status <= 599;

    // Обновляем индикаторы деградации
    const offlineStore = useOfflineStore.getState();
    if (isNetwork) offlineStore.setOffline(true);
    if (is5xx) offlineStore.markServerError();

    // Мягкий тост о проблемах c backend (с троттлингом)
    try {
      if (offlineStore.backendDown) {
        toast.error('Backend is unstable (5xx). We are retrying.');
      }
    } catch {}

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
      useUserStore.getState().logout();
      return Promise.reject(error);
    }

    const { setAuth, setAccessToken } = useUserStore.getState();

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().then((data) => {
          if (data.user) {
            setAuth(data.user, data.tokens.accessToken);
          } else {
            setAccessToken(data.tokens.accessToken);
          }
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

let lastAccessDeniedAt = 0;
function _notifyAccessDeniedOnce() {
  const now = Date.now();
  if (now - lastAccessDeniedAt > 4000) {
    lastAccessDeniedAt = now;
    try { toast.error('Access denied: you do not have permission to perform this action'); } catch {}
  }
}

interface ApiErrorPayload {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };
