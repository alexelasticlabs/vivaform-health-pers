﻿import { registerAs } from "@nestjs/config";

export const stripeConfig = registerAs("stripe", () => {
  const isProd = process.env.NODE_ENV === 'production';
  const apiKey = process.env.STRIPE_API_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  // Warn in production if Stripe is not configured (env validator will catch this earlier)
  if (isProd && (!apiKey || !webhookSecret)) {
    throw new Error('Stripe API keys not configured in production! Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET.');
  }

  return {
    apiKey,
    webhookSecret,
    prices: {
      MONTHLY: process.env.STRIPE_PRICE_MONTHLY ?? "",
      QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY ?? "",
      ANNUAL: process.env.STRIPE_PRICE_ANNUAL ?? ""
    }
  };
});
