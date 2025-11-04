import { ApiProperty } from '@nestjs/swagger';

export class PortalSessionResponseDto {
  @ApiProperty({
    description: 'Stripe Customer Portal session URL',
    example: 'https://billing.stripe.com/session/...',
  })
  url!: string;
}
