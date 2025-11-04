import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionStatusDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: 'cuid123...',
  })
  id!: string;

  @ApiProperty({
    description: 'Subscription status',
    example: 'ACTIVE',
  })
  status!: string;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'MONTHLY',
  })
  plan!: string;

  @ApiProperty({
    description: 'Current period start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  currentPeriodStart!: Date;

  @ApiProperty({
    description: 'Current period end date',
    example: '2025-02-01T00:00:00.000Z',
  })
  currentPeriodEnd!: Date;

  @ApiProperty({
    description: 'Whether subscription is set to cancel at period end',
    example: false,
  })
  cancelAtPeriodEnd!: boolean;

  @ApiProperty({
    description: 'Cancellation date if applicable',
    example: null,
    nullable: true,
  })
  canceledAt!: Date | null;
}
