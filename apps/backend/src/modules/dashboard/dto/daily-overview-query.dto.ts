import { IsDateString, IsOptional } from "class-validator";

export class DailyOverviewQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}