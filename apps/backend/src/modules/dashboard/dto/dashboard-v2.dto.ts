/**
 * Dashboard V2 DTOs
 * Data Transfer Objects for the new dashboard API
 */

import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GoalType {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_WEIGHT = 'gain_weight',
  MAINTAIN_WEIGHT = 'maintain_weight',
  BUILD_MUSCLE = 'build_muscle',
}

export enum AchievementCategory {
  NUTRITION = 'nutrition',
  HYDRATION = 'hydration',
  ACTIVITY = 'activity',
  CONSISTENCY = 'consistency',
  SPECIAL = 'special',
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export class HealthScoreDto {
  @ApiProperty()
  @IsNumber()
  overall!: number;

  @ApiProperty()
  breakdown!: {
    nutrition: number;
    hydration: number;
    activity: number;
    consistency: number;
  };

  @ApiProperty({ enum: ['improving', 'stable', 'declining'] })
  @IsString()
  trend!: 'improving' | 'stable' | 'declining';
}

export class DashboardMetricDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiProperty()
  @IsNumber()
  value!: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  target?: number;

  @ApiProperty()
  @IsString()
  unit!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  trend?: 'up' | 'down' | 'stable';

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  changePercent?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;
}

export class DailyInsightDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: ['tip', 'achievement', 'warning', 'milestone'] })
  @IsString()
  type!: 'tip' | 'achievement' | 'warning' | 'milestone';

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  actionable?: {
    label: string;
    action: string;
  };

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  @IsString()
  priority!: 'high' | 'medium' | 'low';
}

export class AchievementDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  icon!: string;

  @ApiProperty()
  @IsNumber()
  progress!: number;

  @ApiProperty()
  @IsBoolean()
  unlocked!: boolean;

  @ApiPropertyOptional()
  unlockedAt?: Date;

  @ApiProperty({ enum: AchievementCategory })
  @IsEnum(AchievementCategory)
  category!: AchievementCategory;

  @ApiPropertyOptional()
  reward?: {
    type: 'badge' | 'premium-trial' | 'discount' | 'feature-unlock';
    value: string | number;
  };

  @ApiProperty({ enum: AchievementRarity })
  @IsEnum(AchievementRarity)
  rarity!: AchievementRarity;
}

export class StreakDto {
  @ApiProperty()
  @IsNumber()
  current!: number;

  @ApiProperty()
  @IsNumber()
  longest!: number;

  @ApiProperty({ enum: ['daily-logging', 'water-goal', 'calorie-goal', 'activity-goal'] })
  @IsString()
  type!: 'daily-logging' | 'water-goal' | 'calorie-goal' | 'activity-goal';

  @ApiProperty()
  lastUpdated!: Date;
}

export class GoalProgressDto {
  @ApiProperty()
  primaryGoal!: {
    type: GoalType;
    target: number;
    current: number;
    unit: string;
    deadline?: Date;
    progress: number;
  };

  @ApiProperty()
  weeklyProgress!: {
    caloriesOnTrack: number;
    waterGoalsHit: number;
    mealsLogged: number;
    activeStreak: number;
  };
}

export class MealTimelineEntryDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner', 'snack'] })
  @IsString()
  type!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @ApiProperty()
  @IsString()
  time!: string;

  @ApiProperty()
  @IsNumber()
  calories!: number;

  @ApiProperty()
  @IsBoolean()
  logged!: boolean;

  @ApiPropertyOptional()
  items?: {
    name: string;
    calories: number;
  }[];
}

export class DailyDashboardResponseDto {
  @ApiProperty()
  @IsString()
  date!: string;

  @ApiProperty()
  healthScore!: HealthScoreDto;

  @ApiProperty()
  metrics!: {
    calories: DashboardMetricDto;
    water: DashboardMetricDto;
    weight: DashboardMetricDto;
    steps: DashboardMetricDto;
    protein: DashboardMetricDto;
    carbs: DashboardMetricDto;
    fat: DashboardMetricDto;
  };

  @ApiProperty({ type: [MealTimelineEntryDto] })
  mealTimeline!: MealTimelineEntryDto[];

  @ApiProperty({ type: [DailyInsightDto] })
  insights!: DailyInsightDto[];

  @ApiProperty({ type: [StreakDto] })
  streaks!: StreakDto[];

  @ApiProperty({ type: [AchievementDto] })
  achievements!: AchievementDto[];

  @ApiProperty()
  goalProgress!: GoalProgressDto;
}
