import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto, ResetPasswordDto, RequestTempPasswordDto, ForceChangePasswordDto } from "./dto/forgot-password.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOkResponse({ description: "Авторизация пользователя" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @ApiOkResponse({ description: "Обновление access token по refresh" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOkResponse({ description: "Текущий профиль пользователя" })
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getProfile(user.userId);
  }

  @Post("forgot-password")
  @ApiOkResponse({ description: "Запрос на сброс пароля" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  @ApiOkResponse({ description: "Сброс пароля по токену" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("verify-email")
  @ApiOkResponse({ description: "Верификация email" })
  verifyEmail(@Query("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post("request-temp-password")
  @ApiOkResponse({ description: "Запрос временного пароля" })
  requestTempPassword(@Body() dto: RequestTempPasswordDto) {
    return this.authService.requestTempPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("force-change-password")
  @ApiOkResponse({ description: "Принудительная смена пароля после временного" })
  forceChangePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ForceChangePasswordDto) {
    return this.authService.forceChangePassword(user.userId, dto);
  }

  @Post("test-email")
  @ApiOkResponse({ description: "Тестовая отправка email (только для dev)" })
  testEmail(@Body() dto: { email: string }) {
    return this.authService.testEmail(dto.email);
  }
}