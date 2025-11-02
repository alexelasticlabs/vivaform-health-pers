import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class CreateWaterEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMl!: number;
}

export class DailyWaterQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}