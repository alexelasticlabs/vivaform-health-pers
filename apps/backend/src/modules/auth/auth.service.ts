import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";

import { jwtConfig } from "../../config";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtSettings: ConfigType<typeof jwtConfig>
  ) {}

  private async signTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.jwtSettings.secret,
          expiresIn: this.jwtSettings.accessTokenTtl
        }
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: "refresh" },
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

    const tokens = await this.signTokens(user.id, user.email);

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

      const tokens = await this.signTokens(user.id, user.email);

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
}