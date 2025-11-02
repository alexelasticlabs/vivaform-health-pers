import { Inject, Injectable } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import Stripe from "stripe";

import { stripeConfig } from "../../config";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @Inject(stripeConfig.KEY) private readonly stripeSettings: ConfigType<typeof stripeConfig>
  ) {
    this.stripe = new Stripe(this.stripeSettings.apiKey, {
      apiVersion: "2024-06-20",
      appInfo: {
        name: "VivaForm Backend",
        version: "0.1.0"
      }
    });
  }

  get client() {
    return this.stripe;
  }

  getWebhookSecret() {
    return this.stripeSettings.webhookSecret;
  }

  priceForPlan(plan: keyof ConfigType<typeof stripeConfig>["prices"]) {
    return this.stripeSettings.prices[plan];
  }
}