﻿import { registerAs } from "@nestjs/config";

export const stripeConfig = registerAs("stripe", () => {
  const apiKey = process.env.STRIPE_API_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!apiKey || !webhookSecret) {
    const nodeEnv = process.env.NODE_ENV || 'development';
    throw new Error(`Stripe credentials missing for NODE_ENV=${nodeEnv}. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET.`);
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
