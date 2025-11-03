import { IsEmail, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  token!: string;

  @MinLength(8)
  password!: string;
}
