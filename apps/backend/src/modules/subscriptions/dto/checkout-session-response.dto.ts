import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description: 'Stripe Checkout session URL',
    example: 'https://checkout.stripe.com/c/pay/cs_test_...',
  })
  url!: string;

  @ApiProperty({
    description: 'Checkout session ID',
    example: 'cs_test_...',
  })
  sessionId!: string;
}
