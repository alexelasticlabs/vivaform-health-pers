﻿import { registerAs } from "@nestjs/config";

const MIN_SECRET_LENGTH = 32;

function requireEnv(key: string, minLength = 1) {
  const value = process.env[key];
  if (!value || value.length < minLength) {
    const env = process.env.NODE_ENV || "development";
    throw new Error(`${key} is missing or too short in ${env} environment`);
  }
  return value;
}

export const stripeConfig = registerAs("stripe", () => {
  const apiKey = requireEnv("STRIPE_API_KEY", MIN_SECRET_LENGTH);
  const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET", MIN_SECRET_LENGTH);

  const prices = {
    MONTHLY: requireEnv("STRIPE_PRICE_MONTHLY"),
    QUARTERLY: requireEnv("STRIPE_PRICE_QUARTERLY"),
    ANNUAL: requireEnv("STRIPE_PRICE_ANNUAL")
  } as const;

  return {
    apiKey,
    webhookSecret,
    prices
  };
});
