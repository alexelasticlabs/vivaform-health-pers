import { IsString, IsNumber, IsObject, IsBoolean, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Height can be in cm or ft+in
class HeightDto {
  @ApiPropertyOptional({ description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  cm?: number;

  @ApiPropertyOptional({ description: 'Height in feet' })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(8)
  ft?: number;

  @ApiPropertyOptional({ description: 'Height in inches (additional to feet)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(11)
  in?: number;
}

// Weight can be in kg or lb
class WeightDto {
  @ApiPropertyOptional({ description: 'Weight in kilograms' })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  kg?: number;

  @ApiPropertyOptional({ description: 'Weight in pounds' })
  @IsOptional()
  @IsNumber()
  @Min(66)
  @Max(660)
  lb?: number;
}

// Body metrics section
class BodyAnswersDto {
  @ApiProperty({ description: 'Height measurement', type: HeightDto })
  @ValidateNested()
  @Type(() => HeightDto)
  height!: HeightDto;

  @ApiProperty({ description: 'Weight measurement', type: WeightDto })
  @ValidateNested()
  @Type(() => WeightDto)
  weight!: WeightDto;
}

// Goals section
class GoalsAnswersDto {
  @ApiProperty({ description: 'Goal type: lose, maintain, or gain', enum: ['lose', 'maintain', 'gain'] })
  @IsString()
  type!: 'lose' | 'maintain' | 'gain';

  @ApiPropertyOptional({ description: 'Target weight change in kg (positive or negative)' })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  deltaKg?: number;

  @ApiPropertyOptional({ description: 'Expected timeline in months' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  etaMonths?: number;
}

// Diet section
class DietAnswersDto {
  @ApiPropertyOptional({ description: 'Dietary plan preference' })
  @IsOptional()
  @IsString()
  plan?: string;
}

// Habits section
class HabitsAnswersDto {
  @ApiPropertyOptional({ description: 'Number of meals per day' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  mealsPerDay?: number;

  @ApiPropertyOptional({ description: 'Whether user snacks between meals' })
  @IsOptional()
  @IsBoolean()
  snacks?: boolean;

  @ApiPropertyOptional({ description: 'Cooking time available in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(180)
  cookingTimeMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether user exercises regularly' })
  @IsOptional()
  @IsBoolean()
  exerciseRegularly?: boolean;

  // Allow additional fields
  [key: string]: any;
}

// Complete answers structure
class QuizAnswersDto {
  @ApiPropertyOptional({ type: DietAnswersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DietAnswersDto)
  diet?: DietAnswersDto;

  @ApiPropertyOptional({ type: BodyAnswersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BodyAnswersDto)
  body?: BodyAnswersDto;

  @ApiPropertyOptional({ type: GoalsAnswersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GoalsAnswersDto)
  goals?: GoalsAnswersDto;

  @ApiPropertyOptional({ type: HabitsAnswersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HabitsAnswersDto)
  habits?: HabitsAnswersDto;

  // Allow additional sections
  [key: string]: any;
}

export class SubmitQuizDto {
  @ApiProperty({ description: 'Client ID for analytics tracking' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'Quiz schema version', default: 1 })
  @IsNumber()
  @Min(1)
  version!: number;

  @ApiProperty({ description: 'Complete quiz answers', type: QuizAnswersDto })
  @ValidateNested()
  @Type(() => QuizAnswersDto)
  answers!: QuizAnswersDto;

  @ApiPropertyOptional({ description: 'Whether to overwrite existing profile', default: true })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

// DTO for updating quiz profile (partial updates)
export class UpdateQuizProfileDto {
  @ApiPropertyOptional({ description: 'Partial quiz answers to update' })
  @IsOptional()
  @IsObject()
  answers?: Partial<QuizAnswersDto>;
}

