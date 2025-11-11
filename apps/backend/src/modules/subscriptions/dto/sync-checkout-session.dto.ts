import { IsString, Length } from 'class-validator';

export class SyncCheckoutSessionDto {
  @IsString()
  @Length(5, 200)
  sessionId!: string;
}

