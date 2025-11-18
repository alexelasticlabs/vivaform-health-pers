import { Body, Controller, Get, Post, Query, UseGuards, Res, Req, HttpCode, ForbiddenException } from "@nestjs/common";
import { ApiOkResponse, ApiTags, ApiCreatedResponse } from "@nestjs/swagger";
import type { Response, Request } from "express";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { ForgotPasswordDto, ResetPasswordDto, RequestTempPasswordDto, ForceChangePasswordDto } from "./dto/forgot-password.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { ResendVerificationDto } from './dto/resend-verification.dto';
import { ensureCsrfCookie } from '../../common/security/csrf-token.util';

const AUTH_RATE_LIMITS = {
  register: { limit: 5, ttl: 60 },
  login: { limit: 10, ttl: 60 },
  forgotPassword: { limit: 5, ttl: 60 },
  resetPassword: { limit: 5, ttl: 60 },
  verifyEmail: { limit: 5, ttl: 60 },
  requestTempPassword: { limit: 3, ttl: 60 },
  resendVerification: { limit: 3, ttl: 60 }
} as const;

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookiePath() {
    const prefix = process.env.API_PREFIX || '';
    // Гарантируем ведущий слэш если prefix указан без него
    const norm = prefix ? (prefix.startsWith('/') ? prefix : `/${prefix}`) : '';
    return `${norm}/auth/refresh`.replace(/\/+/g, '/');
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.register.limit, ttl: AUTH_RATE_LIMITS.register.ttl } })
  @Post("register")
  @ApiCreatedResponse({ description: "Регистрация пользователя и выдача токенов" })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto as any);
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === 'production',
      path: this.getCookiePath(),
      maxAge: 1000 * 60 * 60 * 24 * 30
    });
    return {
      user: result.user,
      tokens: result.tokens
    };
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.login.limit, ttl: AUTH_RATE_LIMITS.login.ttl } })
  @Post("login")
  @ApiOkResponse({ description: "Авторизация пользователя" })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return (this.authService as any).login(dto).then(({ user, tokens }: any) => {
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === 'production',
        path: this.getCookiePath(),
        maxAge: 1000 * 60 * 60 * 24 * 30
      });
      return { user, tokens };
    });
  }

  @Get("csrf-token")
  @ApiOkResponse({ description: "Выдаёт CSRF cookie для SPA клиентов" })
  csrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = ensureCsrfCookie(req, res);
    return { token };
  }

  @Post("refresh")
  @ApiOkResponse({ description: "Обновление access token по refresh cookie" })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = (req.body as any)?.refreshToken || (req as any).cookies?.refreshToken;
    const { tokens, userId } = await (this.authService as any).refresh({ refreshToken: rt });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === 'production',
      path: this.getCookiePath(),
      maxAge: 1000 * 60 * 60 * 24 * 30
    });
    // Возвращаем вместе с user для клиентов, ожидающих user + tokens
    const user = await (this.authService as any).getProfile(userId);
    return { user, tokens };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOkResponse({ description: "Текущий профиль пользователя" })
  me(@CurrentUser() user: CurrentUserPayload) {
    return (this.authService as any).getProfile(user.userId);
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.forgotPassword.limit, ttl: AUTH_RATE_LIMITS.forgotPassword.ttl } })
  @Post("forgot-password")
  @ApiOkResponse({ description: "Запрос на сброс пароля" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return (this.authService as any).forgotPassword(dto);
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.resetPassword.limit, ttl: AUTH_RATE_LIMITS.resetPassword.ttl } })
  @Post("reset-password")
  @ApiOkResponse({ description: "Сброс пароля по токену" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return (this.authService as any).resetPassword(dto);
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.verifyEmail.limit, ttl: AUTH_RATE_LIMITS.verifyEmail.ttl } })
  @Get("verify-email")
  @ApiOkResponse({ description: "Верификация email" })
  verifyEmail(@Query("token") token: string) {
    return (this.authService as any).verifyEmail(token);
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.requestTempPassword.limit, ttl: AUTH_RATE_LIMITS.requestTempPassword.ttl } })
  @Post("request-temp-password")
  @ApiOkResponse({ description: "Запрос временного пароля" })
  requestTempPassword(@Body() dto: RequestTempPasswordDto) {
    return (this.authService as any).requestTempPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("force-change-password")
  @ApiOkResponse({ description: "Принудительная смена пароля после временного" })
  forceChangePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ForceChangePasswordDto) {
    return (this.authService as any).forceChangePassword(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post("test-email")
  @HttpCode(202)
  @ApiOkResponse({ description: "Тестовая отправка email (только для dev)" })
  testEmail(@Body() dto: { email: string }) {
    if (process.env.NODE_ENV !== 'development' && process.env.ALLOW_TEST_EMAIL !== 'true') {
      throw new ForbiddenException('Route disabled outside development');
    }
    return (this.authService as any).testEmail(dto.email);
  }

  @Throttle({ default: { limit: AUTH_RATE_LIMITS.resendVerification.limit, ttl: AUTH_RATE_LIMITS.resendVerification.ttl } })
  @Post("resend-verification")
  @ApiOkResponse({ description: "Повторная отправка письма для верификации email" })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return (this.authService as any).resendVerification(dto.email);
  }
}