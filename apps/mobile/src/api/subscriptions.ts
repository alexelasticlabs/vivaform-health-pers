import Constants from "expo-constants";

import { SubscriptionPlan, SubscriptionTier } from "@vivaform/shared";

import { request } from "./client";

const checkoutSuccessUrl = Constants.expoConfig?.extra?.checkoutSuccessUrl ?? "https://vivaform.app/checkout-success";
const checkoutCancelUrl = Constants.expoConfig?.extra?.checkoutCancelUrl ?? "https://vivaform.app/checkout-cancel";

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  status?: string;
  currentPeriodEnd?: string;
} | null;

export const getSubscription = () => request<SubscriptionStatus>("/subscriptions");

export const createCheckoutSession = (plan: SubscriptionPlan) =>
  request<{ url: string }>("/subscriptions/checkout", {
    method: "POST",
    body: JSON.stringify({
      plan,
      successUrl: checkoutSuccessUrl,
      cancelUrl: checkoutCancelUrl
    })
  });