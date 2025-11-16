import { IsEmail, MinLength, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class RequestTempPasswordDto {
  @IsEmail()
  email!: string;
}

export class ForceChangePasswordDto {
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
