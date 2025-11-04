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