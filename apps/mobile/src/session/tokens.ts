import type { AuthTokens } from "../api/auth";

let currentTokens: AuthTokens | null = null;

export const setSessionTokens = (tokens: AuthTokens | null) => {
  currentTokens = tokens;
};

export const getSessionTokens = () => currentTokens;