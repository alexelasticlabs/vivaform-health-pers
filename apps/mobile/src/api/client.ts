import Constants from "expo-constants";

import type { AuthTokens, AuthUser } from "../api/auth";
import { useUserStore } from "../store/user-store";
import { getSessionTokens } from "../session/tokens";

const apiUrl = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:4000";

const withAuthHeaders = (init?: RequestInit): RequestInit => {
  const headers = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {})
  } as Record<string, string>;

  const tokens = getSessionTokens();
  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return { ...init, headers };
};

let refreshPromise: Promise<{ user: AuthUser; tokens: AuthTokens } | null> | null = null;

const performRefresh = async (): Promise<{ user: AuthUser; tokens: AuthTokens } | null> => {
  const tokens = getSessionTokens();
  if (!tokens?.refreshToken) {
    return null;
  }

  const response = await fetch(`${apiUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken: tokens.refreshToken })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { user: AuthUser; tokens: AuthTokens };
  useUserStore.getState().setSession(data.user, data.tokens);
  return data;
};

export const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const execute = async (): Promise<Response> =>
    fetch(`${apiUrl}${path}`, withAuthHeaders(init));

  let response = await execute();

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = performRefresh();
      refreshPromise.finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (!refreshed) {
      useUserStore.getState().clearSession();
      throw new Error("Session expired");
    }

    response = await execute();
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error: ${response.status}`);
  }

  const hasJson = response.headers.get("content-type")?.includes("application/json");
  if (!hasJson) {
    return undefined as T;
  }

  return (await response.json()) as T;
};