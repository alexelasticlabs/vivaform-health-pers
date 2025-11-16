import { IsString, IsNumber, IsObject, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({ description: 'Client ID for analytics tracking' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'Quiz schema version', default: 1 })
  @IsNumber()
  @Min(1)
  version!: number;

  @ApiProperty({ description: 'Raw quiz answers payload', type: 'object', additionalProperties: true })
  @IsObject()
  answers!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether to overwrite existing profile', default: true })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

// DTO for updating quiz profile (partial updates)
export class UpdateQuizProfileDto {
  @ApiPropertyOptional({ description: 'Partial quiz answers to update', type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  answers?: Record<string, any>;
}

