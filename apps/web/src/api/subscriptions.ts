import type { SubscriptionPlan, SubscriptionTier } from "@vivaform/shared";

import { apiClient } from "./client";

export type SubscriptionRecord = {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscription: string;
  priceId: string;
  currentPeriodEnd: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tier?: SubscriptionTier;
};

export type CheckoutSessionPayload = {
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
};

export type PortalSessionPayload = {
  returnUrl: string;
};

export type CheckoutSessionResponse = {
  id: string;
  url: string | null;
};

export type PortalSessionResponse = {
  url: string | null;
};

export type SubscriptionHistoryItem = { id: string; action: string; createdAt: string; metadata?: any };
export type SubscriptionHistoryResponse = {
  items: SubscriptionHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
};

export const fetchSubscription = async () => {
  const { data } = await apiClient.get<SubscriptionRecord | null>("/subscriptions");
  return data;
};

export const createCheckoutSession = async (payload: CheckoutSessionPayload) => {
  const { data } = await apiClient.post<CheckoutSessionResponse>("/subscriptions/checkout", payload);
  return data;
};

export const createPortalSession = async (payload: PortalSessionPayload) => {
  const { data } = await apiClient.post<PortalSessionResponse>("/subscriptions/portal", payload);
  return data;
};

export const syncCheckoutSession = async (sessionId: string) => {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    "/subscriptions/sync-session",
    { sessionId }
  );
  return data;
};

export const fetchSubscriptionHistory = async (page = 1, pageSize = 10, filters?: { actions?: string[]; from?: string; to?: string }) => {
  const params: any = { page, pageSize };
  if (filters?.actions?.length) params.actions = filters.actions.join(',');
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  const { data } = await apiClient.get<SubscriptionHistoryResponse>(`/subscriptions/history`, { params });
  return data;
};

export const logPremiumView = async () => {
  try {
    await apiClient.get('/subscriptions/premium-view');
  } catch {}
};
