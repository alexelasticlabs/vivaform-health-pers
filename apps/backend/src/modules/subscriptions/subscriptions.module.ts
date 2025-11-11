import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { StripeModule } from "../stripe/stripe.module";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  imports: [StripeModule, AuditModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService]
})
export class SubscriptionsModule {}
