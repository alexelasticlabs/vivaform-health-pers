-- AlterTable
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_stripeSubscription_key" UNIQUE ("stripeSubscription");
