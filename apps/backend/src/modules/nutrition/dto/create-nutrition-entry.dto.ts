import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateNutritionEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  @IsNotEmpty()
  mealType!: string;

  @IsString()
  @IsNotEmpty()
  food!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  calories!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  protein!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fat!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  carbs!: number;
}

export class DailyQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}