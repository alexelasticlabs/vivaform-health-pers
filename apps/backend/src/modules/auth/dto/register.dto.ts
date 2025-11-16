import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

import { PASSWORD_MIN_LENGTH } from './password.constants';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

