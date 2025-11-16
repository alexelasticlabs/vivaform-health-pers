import { IsEmail, IsString, MinLength } from "class-validator";

import { PASSWORD_MIN_LENGTH } from "./password.constants";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password!: string;
}