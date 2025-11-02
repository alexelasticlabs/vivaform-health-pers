import { Module } from "@nestjs/common";

import { StripeModule } from "../stripe/stripe.module";
import { StripeWebhookController } from "./stripe-webhook.controller";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  imports: [StripeModule],
  controllers: [SubscriptionsController, StripeWebhookController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService]
})
export class SubscriptionsModule {}
