import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateRecommendationDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  body!: string;
}

export class RecommendationsQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class LatestRecommendationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}