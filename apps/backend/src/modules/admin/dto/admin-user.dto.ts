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

