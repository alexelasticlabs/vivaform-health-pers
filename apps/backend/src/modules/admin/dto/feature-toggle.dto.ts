import { IsString, IsBoolean, IsInt, Min, Max, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureToggleDto {
  @ApiProperty({ example: 'new_quiz_flow' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ example: 'Enable new quiz flow for users' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: 0, minimum: 0, maximum: 100, default: 0 })
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercent: number;

  @ApiPropertyOptional({ example: { targetAudience: 'new_users' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateFeatureToggleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

