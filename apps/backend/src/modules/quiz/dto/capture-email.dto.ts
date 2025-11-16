import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, IsObject } from 'class-validator';

export enum QuizLeadCaptureType {
  MIDPOINT = 'midpoint',
  EXIT = 'exit',
  OFFER = 'offer',
}

export class CaptureQuizEmailDto {
  @ApiProperty({ description: 'Email used to send the saved plan link' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Client fingerprint generated on the quiz front-end' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Current quiz step when the capture happened' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(64)
  step?: number;

  @ApiPropertyOptional({ description: 'Lead capture type (midpoint, exit, etc)', enum: QuizLeadCaptureType })
  @IsOptional()
  @IsEnum(QuizLeadCaptureType)
  type?: QuizLeadCaptureType;

  @ApiPropertyOptional({ description: 'Additional metadata from the client (safe fields only)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
