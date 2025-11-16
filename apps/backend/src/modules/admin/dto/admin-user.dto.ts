﻿import { IsEmail, IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRole } from '@vivaform/shared';

export class UpdateUserRoleDto {
  @ApiPropertyOptional({ enum: ['USER', 'ADMIN', 'MANAGER', 'SUPPORT'] })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'MANAGER', 'SUPPORT'])
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class AdminUserQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN', 'MANAGER', 'SUPPORT'] })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'MANAGER', 'SUPPORT'])
  role?: string;

  @ApiPropertyOptional({ enum: ['FREE', 'PREMIUM'] })
  @IsOptional()
  @IsEnum(['FREE', 'PREMIUM'])
  tier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}

export class ImpersonateUserDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'])
  status?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class ReplyTicketDto {
  @ApiProperty()
  @IsString()
  body!: string;
}

export class UpdateFoodItemDto {
  @ApiProperty()
  @IsBoolean()
  verified!: boolean;
}

export class PatchSettingsDto {
  // Settings can be arbitrary key-value pairs
  // Add specific validation per setting key if needed
  [key: string]: unknown;
}

