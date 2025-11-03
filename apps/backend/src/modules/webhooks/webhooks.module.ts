import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { StripeModule } from '../stripe/stripe.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [StripeModule, SubscriptionsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
