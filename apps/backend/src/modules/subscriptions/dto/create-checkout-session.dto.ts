import { IsEnum, IsUrl } from "class-validator";

enum SubscriptionPlan {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual"
}

export class CreateCheckoutSessionDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsUrl()
  successUrl!: string;

  @IsUrl()
  cancelUrl!: string;
}

export class CreatePortalSessionDto {
  @IsUrl()
  returnUrl!: string;
}

export { SubscriptionPlan };