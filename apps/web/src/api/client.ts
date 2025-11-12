﻿import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from 'sonner';

import { useUserStore, useOfflineStore } from "@/store";
import type { AuthTokens, AuthUser } from "@vivaform/shared";

const baseURL = import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL;
if (!import.meta.env.DEV && !baseURL) {
  // Жёсткий фейл на рантайме, но сборка отловит раньше
  throw new Error("VITE_API_URL is required in production build");
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
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

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

type ApiErrorPayload = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

let dynamicAuthMockEnabled = false;
let dynamicSubQuizMockEnabled = false;
const AUTO_MOCKS = (import.meta.env.VITE_AUTO_AUTH_MOCKS ?? '1') as string;
const shouldEnableDynamicAuthMocks = () => import.meta.env.DEV && AUTO_MOCKS !== '0';
if (import.meta.env.DEV && AUTO_MOCKS === '1') {
  dynamicAuthMockEnabled = true;
  dynamicSubQuizMockEnabled = true;
}

function buildAuthMockFromConfig(config: InternalAxiosRequestConfig) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const body = (() => { try { return config.data ? JSON.parse(config.data as any) : {}; } catch { return {}; } })();
  const respond = (data: any, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config });
  if (url.includes('/auth/login') && method === 'post') {
    return respond({ user: { id: 'mock-user', email: body.email || 'user@example.com', name: 'Mock User', tier: 'FREE' }, tokens: { accessToken: 'mock-at', refreshToken: 'mock-rt' } });
  }
  if (url.includes('/auth/register') && method === 'post') {
    return respond({ user: { id: 'mock-user', email: body.email || 'new@example.com', name: body.name || 'New User', tier: 'FREE' }, tokens: { accessToken: 'mock-at', refreshToken: 'mock-rt' } });
  }
  if (url.includes('/auth/refresh') && method === 'post') {
    return respond({ tokens: { accessToken: 'mock-at', refreshToken: 'mock-rt' } });
  }
  if (url.includes('/auth/forgot-password') && method === 'post') {
    return respond({ message: 'If account exists, email sent' });
  }
  if (url.includes('/auth/request-temp-password') && method === 'post') {
    return respond({ message: 'Temporary password sent (mock)' });
  }
  if (url.includes('/auth/reset-password') && method === 'post') {
    return respond({ message: 'Password reset (mock)' });
  }
  if (url.includes('/auth/force-change-password') && method === 'post') {
    return respond({ message: 'Password changed (mock)' });
  }
  return null;
}

function buildSubQuizMockFromConfig(config: InternalAxiosRequestConfig) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const respond = (data: any, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config });
  // Subscriptions
  if (url.includes('/subscriptions')) {
    if (method === 'get') {
      if (url.includes('/history')) return respond({ items: [], total: 0, page: 1, pageSize: 10, hasNext: false });
      if (url.includes('/premium-view')) return respond({ ok: true });
      return respond(null);
    }
    if (url.includes('/checkout') && method === 'post') return respond({ id: 'cs_mock', url: 'https://stripe.test/checkout-session/mock' });
    if (url.includes('/portal') && method === 'post') return respond({ url: 'https://stripe.test/customer-portal/mock' });
    if (url.includes('/sync-session') && method === 'post') return respond({ success: true, message: 'Synced (mock)' });
  }
  // Quiz
  if (url.includes('/quiz/profile')) {
    if (method === 'get') return respond({ id: 'qp_mock', version: 1, answers: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    if (method === 'patch') return respond({ userId: 'mock-user', stored: true, profile: { updatedAt: new Date().toISOString() } });
  }
  if (url.includes('/quiz/preview')) {
    if (method === 'get') return respond({ clientId: 'mock-client', version: 1, answers: {}, savedAt: new Date().toISOString() });
    if (method === 'post') return respond({ ok: true, savedAt: new Date().toISOString() });
  }
  if (url.includes('/quiz/submit') && method === 'post') return respond({ userId: 'mock-user', stored: true, profile: { updatedAt: new Date().toISOString() } });
  return null;
}

function buildExtendedMockFromConfig(config: InternalAxiosRequestConfig) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const respond = (data: any, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config });

  // Dashboard daily
  if (url.includes('/dashboard/daily') && method === 'get') {
    const date = (config.params as any)?.date || new Date().toISOString().slice(0,10);
    return respond({
      date,
      goals: { calories: 2100, protein: 120, fat: 70, carbs: 230, waterMl: 2000 },
      hydration: { totalMl: 750, goal: 2000 },
      water: { totalMl: 750, goal: 2000 },
      weight: { latestKg: 70, trend: 'stable' },
      meals: [],
      nutrition: { summary: { protein: 80, fat: 60, carbs: 180, calories: 1600 }, entries: [] },
      macros: { protein: 80, fat: 60, carbs: 180, caloriesConsumed: 1600, calorieGoal: 2100 },
      recommendations: [
        { id: 'r1', title: 'Hydrate early', body: 'Start your day with a glass of water.' },
        { id: 'r2', title: 'Balanced plate', body: 'Aim for protein with every meal.' }
      ]
    });
  }
  // Water
  if (url.endsWith('/water') && method === 'post') {
    try {
      const body = config.data ? JSON.parse(config.data as any) : {};
      const ml = body.amountMl ?? body.ml ?? 250;
      return respond({ id: 'w' + Date.now(), ml, createdAt: new Date().toISOString() });
    } catch { return respond({ id: 'w' + Date.now(), ml: 250, createdAt: new Date().toISOString() }); }
  }
  if (url.startsWith('/water') && method === 'get') {
    return respond([{ id: 'w1', ml: 250, createdAt: new Date().toISOString() }]);
  }
  // Weight
  if (url.endsWith('/weight') && method === 'post') {
    try {
      const body = config.data ? JSON.parse(config.data as any) : {};
      return respond({ id: 'wt' + Date.now(), kg: body.kg || 70, createdAt: new Date().toISOString() });
    } catch { return respond({ id: 'wt' + Date.now(), kg: 70, createdAt: new Date().toISOString() }); }
  }
  if (url.startsWith('/weight/progress') && method === 'get') {
    return respond({ delta: 0, start: { id: 'wt0', kg: 70, createdAt: new Date().toISOString() }, end: { id: 'wt1', kg: 70, createdAt: new Date().toISOString() } });
  }
  if (url.startsWith('/weight') && method === 'get') {
    return respond([{ id: 'wt1', kg: 70, createdAt: new Date().toISOString() }]);
  }
  // Nutrition foods popular
  if (url.includes('/nutrition/foods/popular') && method === 'get') {
    return respond([{ id: 'f1', name: 'Apple', calories: 52 }, { id: 'f2', name: 'Chicken Breast', calories: 165 }]);
  }
  // Recommendations latest
  if (url.includes('/recommendations/latest') && method === 'get') {
    return respond({ items: [ { id: 'rr1', title: 'Stay hydrated', body: 'Drink small sips hourly.' } ] });
  }
  return null;
}

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuth = /\/auth\//.test(url);
  const isSubOrQuiz = /\/(subscriptions|quiz)\//.test(url) || url.includes('/quiz/profile') || url.includes('/quiz/preview') || url.includes('/quiz/submit');
  const manualMocks = import.meta.env.DEV && import.meta.env.VITE_API_MOCKS === '1';
  const dynamic = dynamicAuthMockEnabled || dynamicSubQuizMockEnabled;
  const shouldMockNow = import.meta.env.DEV && (manualMocks || dynamic);

  if (shouldMockNow && (isAuth || isSubOrQuiz)) {
    const builder = isAuth ? buildAuthMockFromConfig : buildSubQuizMockFromConfig;
    const mockAdapter = async () => {
      const resp = builder(config);
      if (resp) return resp;
      // fallback to minimal OK
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    };
    (config as any).adapter = mockAdapter;
  }

  const isExtended = /\/(dashboard|water|weight|nutrition|recommendations)\//.test(url) || url.includes('/nutrition/foods/popular');
  if (shouldMockNow && isExtended) {
    const resp = buildExtendedMockFromConfig(config);
    if (resp) {
      (config as any).adapter = async () => resp;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Если ранее были офлайн — при первом успешном ответе скрываем баннер
    const { offline, setOffline } = useOfflineStore.getState();
    if (offline) setOffline(false);
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    // AUTO MOCK FALLBACK (auth endpoints) when backend unreachable or 5xx
    const url = error?.config?.url || '';
    const method = (error?.config?.method || 'get').toLowerCase();
    const isAuthEndpoint = /\/auth\//.test(url);
    const isSubOrQuizEndpoint = /\/(subscriptions|quiz)\//.test(url);
    const networkLike = error.code === 'ERR_NETWORK' || (error.message && /Network Error|ECONNREFUSED|ENOTFOUND/i.test(error.message));
    const serverFailure = error.response?.status && error.response.status >= 500;

    if (shouldEnableDynamicAuthMocks() && (networkLike || serverFailure)) {
      if (isAuthEndpoint && !dynamicAuthMockEnabled) {
        dynamicAuthMockEnabled = true;
        if (!SILENT_MOCK_LOGS) console.info('[mocks:auto] enabling auth mocks due to backend unavailability');
      }
      if (isSubOrQuizEndpoint && !dynamicSubQuizMockEnabled) {
        dynamicSubQuizMockEnabled = true;
        if (!SILENT_MOCK_LOGS) console.info('[mocks:auto] enabling subscriptions/quiz mocks');
      }
    }

    if (dynamicAuthMockEnabled && isAuthEndpoint) {
      return mockAuthResponse(error, method);
    }
    if (dynamicSubQuizMockEnabled && isSubOrQuizEndpoint) {
      return mockSubQuizResponse(error, method);
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

    const { setAuth, setAccessToken } = useUserStore.getState();

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().then((data) => {
          if (data.user) {
            setAuth(data.user, data.tokens.accessToken);
          } else {
            // Токен-онли ответ: оставляем профиль как есть, обновляем accessToken
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

// Helper to build mock auth responses (reused by manual or auto mocks)
function mockAuthResponse(error: AxiosError, method: string) {
  const url = error?.config?.url || '';
  const respond = (data: any, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config: error.config });
  try {
    if (url.includes('/auth/login') && method === 'post') {
      const body = error.config?.data ? JSON.parse(error.config.data) : {};
      return respond({ user: { id: 'mock-user', email: body.email || 'user@example.com', name: 'Mock User', tier: 'FREE' }, tokens: { accessToken: 'mock-at', refreshToken: 'mock-rt' } });
    }
    if (url.includes('/auth/register') && method === 'post') {
      const body = error.config?.data ? JSON.parse(error.config.data) : {};
      return respond({ user: { id: 'mock-user', email: body.email || 'new@example.com', name: body.name || 'New User', tier: 'FREE' }, tokens: { accessToken: 'mock-at', refreshToken: 'mock-rt' } });
    }
    if (url.includes('/auth/refresh') && method === 'post') {
      return respond({ tokens: { accessToken: 'mock-at', refreshToken: 'mock-rt' } });
    }
    if (url.includes('/auth/forgot-password') && method === 'post') {
      return respond({ message: 'If account exists, email sent' });
    }
    if (url.includes('/auth/request-temp-password') && method === 'post') {
      return respond({ message: 'Temporary password sent (mock)' });
    }
    if (url.includes('/auth/reset-password') && method === 'post') {
      return respond({ message: 'Password reset (mock)' });
    }
    if (url.includes('/auth/force-change-password') && method === 'post') {
      return respond({ message: 'Password changed (mock)' });
    }
  } catch {}
  return Promise.reject(error);
}

// Helper to build mock subscriptions and quiz responses
function mockSubQuizResponse(error: AxiosError, method: string) {
  const url = error?.config?.url || '';
  const respond = (data: any, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config: error.config });
  try {
    // Subscriptions
    if (url.includes('/subscriptions') && method === 'get') {
      if (url.includes('/history')) {
        return respond({ items: [], total: 0, page: 1, pageSize: 10, hasNext: false });
      }
      if (url.includes('/premium-view')) {
        return respond({ ok: true });
      }
      return respond(null); // fetchSubscription
    }
    if (url.includes('/subscriptions/checkout') && method === 'post') {
      return respond({ id: 'cs_mock', url: 'https://stripe.test/checkout-session/mock' });
    }
    if (url.includes('/subscriptions/portal') && method === 'post') {
      return respond({ url: 'https://stripe.test/customer-portal/mock' });
    }
    if (url.includes('/subscriptions/sync-session') && method === 'post') {
      return respond({ success: true, message: 'Synced (mock)' });
    }

    // Quiz
    if (url.includes('/quiz/profile')) {
      if (method === 'get') {
        return respond({ id: 'qp_mock', version: 1, answers: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      if (method === 'patch') {
        return respond({ userId: 'mock-user', stored: true, profile: { updatedAt: new Date().toISOString() } });
      }
    }
    if (url.includes('/quiz/preview')) {
      if (method === 'get') {
        return respond({ clientId: 'mock-client', version: 1, answers: {}, savedAt: new Date().toISOString() });
      }
      if (method === 'post') {
        return respond({ ok: true, savedAt: new Date().toISOString() });
      }
    }
    if (url.includes('/quiz/submit') && method === 'post') {
      return respond({ userId: 'mock-user', stored: true, profile: { updatedAt: new Date().toISOString() } });
    }
  } catch {}
  return Promise.reject(error);
}

const SILENT_MOCK_LOGS = import.meta.env.VITE_SILENCE_MOCK_LOGS === '1';
// Manual mocks (existing) extended to reuse helper
if (import.meta.env.DEV && import.meta.env.VITE_API_MOCKS === '1') {
  apiClient.interceptors.response.use(undefined, async (error) => {
    const url = error?.config?.url || '';
    const method = (error?.config?.method || 'get').toLowerCase();
    if (/\/auth\//.test(url)) {
      if (!SILENT_MOCK_LOGS) console.info('[mocks] auth endpoint mocked:', url);
      return mockAuthResponse(error, method);
    }
    if (/\/(subscriptions|quiz)\//.test(url)) {
      if (!SILENT_MOCK_LOGS) console.info('[mocks] subscriptions/quiz endpoint mocked:', url);
      return mockSubQuizResponse(error, method);
    }
    return Promise.reject(error);
  });
}

let lastAccessDeniedAt = 0;
function _notifyAccessDeniedOnce() {
  const now = Date.now();
  if (now - lastAccessDeniedAt > 4000) {
    lastAccessDeniedAt = now;
    try { toast.error('Access denied: you do not have permission to perform this action'); } catch {}
  }
}
