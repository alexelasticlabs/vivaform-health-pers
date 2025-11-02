import { registerAs } from "@nestjs/config";

export const stripeConfig = registerAs("stripe", () => ({
  apiKey: process.env.STRIPE_API_KEY ?? "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  prices: {
    monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
    quarterly: process.env.STRIPE_PRICE_QUARTERLY ?? "",
    annual: process.env.STRIPE_PRICE_ANNUAL ?? ""
  }
}));