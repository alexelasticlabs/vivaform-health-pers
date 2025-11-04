import { IsEnum, IsUrl } from "class-validator";
import { SubscriptionPlan } from "@prisma/client";

export class CreateCheckoutSessionDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsUrl({ require_tld: false })
  successUrl!: string;

  @IsUrl({ require_tld: false })
  cancelUrl!: string;
}

export class CreatePortalSessionDto {
  @IsUrl({ require_tld: false })
  returnUrl!: string;
}