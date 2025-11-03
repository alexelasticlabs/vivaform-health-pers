import { IsEmail, MinLength, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @MinLength(8)
  newPassword!: string;
}

export class RequestTempPasswordDto {
  @IsEmail()
  email!: string;
}

export class ForceChangePasswordDto {
  @MinLength(8)
  newPassword!: string;
}
