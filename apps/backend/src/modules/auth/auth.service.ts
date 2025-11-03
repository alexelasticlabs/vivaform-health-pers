import { Inject, Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";

import { jwtConfig } from "../../config";
import { UsersService } from "../users/users.service";
import { EmailService } from "../email/email.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(jwtConfig.KEY) private readonly jwtSettings: ConfigType<typeof jwtConfig>
  ) {}

  private async signTokens(userId: string, email: string, role?: string, tier?: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, tier },
        {
          secret: this.jwtSettings.secret,
          expiresIn: this.jwtSettings.accessTokenTtl
        }
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role, tier, type: "refresh" },
        {
          secret: this.jwtSettings.refreshSecret,
          expiresIn: this.jwtSettings.refreshTokenTtl
        }
      )
    ]);

    return { accessToken, refreshToken };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    const tokens = await this.signTokens(user.id, user.email, user.role, user.tier);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier
      },
      tokens
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type?: string }>(
        dto.refreshToken,
        {
          secret: this.jwtSettings.refreshSecret
        }
      );

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Недействительный refresh token");
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("Пользователь не найден");
      }

      const tokens = await this.signTokens(user.id, user.email, user.role, user.tier);

      return {
        user,
        tokens
      };
    } catch (error) {
      throw new UnauthorizedException("Недействительный refresh token");
    }
  }

  async getProfile(userId: string) {
    const profile = await this.usersService.findById(userId);
    if (!profile) {
      throw new UnauthorizedException("Пользователь не найден");
    }
    return profile;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    
    // Don't reveal whether email exists for security
    if (!user) {
      return {
        message: "Если email существует, на него будет отправлена ссылка для сброса пароля"
      };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: "password_reset" },
      {
        secret: this.jwtSettings.secret,
        expiresIn: "1h"
      }
    );

    // Send email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: "Если email существует, на него будет отправлена ссылка для сброса пароля"
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      // Verify token
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type: string }>(
        dto.token,
        {
          secret: this.jwtSettings.secret
        }
      );

      if (payload.type !== "password_reset" || payload.email !== dto.email) {
        throw new BadRequestException("Недействительный токен сброса пароля");
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException("Пользователь не найден");
      }

      // Hash new password
      const passwordHash = await argon2.hash(dto.password);

      // Update password
      await this.usersService.updatePassword(user.id, passwordHash);

      return {
        message: "Пароль успешно изменён"
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Недействительный или истёкший токен сброса пароля");
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type: string }>(
        token,
        {
          secret: this.jwtSettings.secret
        }
      );

      if (payload.type !== "email_verification") {
        throw new BadRequestException("Недействительный токен верификации");
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException("Пользователь не найден");
      }

      // Mark email as verified
      await this.usersService.verifyEmail(user.id);

      return {
        message: "Email успешно подтверждён"
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Недействительный или истёкший токен верификации");
    }
  }
}