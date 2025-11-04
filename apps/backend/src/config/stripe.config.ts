import { registerAs } from "@nestjs/config";

export const stripeConfig = registerAs("stripe", () => ({
  apiKey: process.env.STRIPE_API_KEY ?? "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  prices: {
    MONTHLY: process.env.STRIPE_PRICE_MONTHLY ?? "",
    QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY ?? "",
    ANNUAL: process.env.STRIPE_PRICE_ANNUAL ?? ""
  }
}));