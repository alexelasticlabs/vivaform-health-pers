import { Inject, Injectable, UnauthorizedException, BadRequestException, ConflictException, Logger } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";

import { jwtConfig } from "../../config";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UsersService } from "../users/users.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { EmailService } from "../email/email.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditService } from "../audit/audit.service";
import type { LoginDto } from "./dto/login.dto";
import type { RefreshTokenDto } from "./dto/refresh-token.dto";
import type { ForgotPasswordDto, ResetPasswordDto, RequestTempPasswordDto, ForceChangePasswordDto } from "./dto/forgot-password.dto";
import type { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
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

  async register(dto: RegisterDto) {
    // Проверка дубля email
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Этот email уже зарегистрирован");
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name || null,
        emailVerified: false
      }
    });

    // Аудит регистрации
    await this.auditService.logRegistration(user.id, user.email);

    // Создаём верификационный токен (JWT type: email_verification, 24h TTL)
    const emailToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: "email_verification" },
      { secret: this.jwtSettings.secret, expiresIn: "24h" }
    );
    // Отправляем письмо
    await this.emailService.sendVerificationEmail(user.email, emailToken);
    // Welcome письмо можно отложить до подтверждения email, но e2e не проверяют — оставим включённым мягко
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name || "there");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      this.logger.warn(`sendWelcomeEmail failed for user=${user.email}: ${reason}`);
    }

    // Выдаём токены сразу (как ожидают e2e)
    const tokens = await this.signTokens(user.id, user.email, user.role, user.tier);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        mustChangePassword: user.mustChangePassword || false
      },
      tokens
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      this.logger.debug(`validateUser: user not found or no password hash for email=${email}`);
      return null;
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      this.logger.debug(`validateUser: password verification failed for email=${email}`);
      return null;
    }

    this.logger.debug(`validateUser: success for email=${email}, role=${user.role}`);
    return user;
  }

  async login(dto: LoginDto) {
    this.logger.debug(`login attempt: email=${dto.email}`);
    // Try temp password first, then regular password
    const { user, isTempPassword } = await this.validateTempPassword(dto.email, dto.password);
    
    if (!user) {
      // Fallback to regular validation
      const regularUser = await this.validateUser(dto.email, dto.password);
      if (!regularUser) {
        this.logger.warn(`login failed: invalid credentials for email=${dto.email}`);
        throw new UnauthorizedException("Invalid email or password");
      }
      
      this.logger.log(`login success: userId=${regularUser.id}, email=${regularUser.email}, role=${regularUser.role}`);
      // Audit log
      await this.auditService.logLogin(regularUser.id);

      const tokens = await this.signTokens(regularUser.id, regularUser.email, regularUser.role, regularUser.tier);

      return {
        user: {
          id: regularUser.id,
          email: regularUser.email,
          name: regularUser.name,
          tier: regularUser.tier,
          mustChangePassword: regularUser.mustChangePassword || false
        },
        tokens
      };
    }

    // Audit log (temp password or regular)
    await this.auditService.logLogin(user.id);

    const tokens = await this.signTokens(user.id, user.email, user.role, user.tier);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        mustChangePassword: user.mustChangePassword || isTempPassword
      },
      tokens
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const token = dto.refreshToken || '';
    let payload: { sub: string; email: string; type?: string } | null = null;
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type?: string }>(
        token,
        { secret: this.jwtSettings.refreshSecret }
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!payload || payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    const tokens = await this.signTokens(user.id, user.email, user.role, user.tier);
    return { user, tokens };
  }

  async getProfile(userId: string) {
    const profile = await this.usersService.findById(userId);
    if (!profile) {
      throw new UnauthorizedException("User not found");
    }
    return profile;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    
    // Don't reveal whether email exists for security
    if (!user) {
      return {
        message: "If this email exists, we've sent instructions to your inbox."
      };
    }

    // Generate cryptographically secure token
    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(resetToken);

    // Store token in database with 60 minute expiry
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 60 minutes
      }
    });

    // Send email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    // Audit log
    await this.auditService.logPasswordResetRequest(user.id);

    return {
      message: "If this email exists, we've sent instructions to your inbox."
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Find valid token
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        expiresAt: { gte: new Date() },
        usedAt: null
      },
      include: { user: true }
    });

    // Verify token hash
    let validToken = null;
    for (const token of tokens) {
      const isValid = await argon2.verify(token.tokenHash, dto.token);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: validToken.id },
      data: { usedAt: new Date() }
    });

    // Hash new password
    const passwordHash = await argon2.hash(dto.newPassword);

    // Update password and clear mustChangePassword flag
    await this.prisma.user.update({
      where: { id: validToken.userId },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    });

    // Audit log
    await this.auditService.logPasswordReset(validToken.userId);

    return {
      message: "Password updated. You can log in now."
    };
  }

  async verifyEmail(token: string) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type: string }>(
      token,
      { secret: this.jwtSettings.secret }
    );
    if (!payload || payload.type !== "email_verification") {
      throw new BadRequestException("Invalid verification token");
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    await this.usersService.verifyEmail(user.id);
    return { message: "Email successfully verified" };
  }

  /**
   * Generate and send temporary one-time password
   */
  async requestTempPassword(dto: RequestTempPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Don't reveal whether email exists
    if (!user) {
      return {
        message: "If this email exists, we've sent instructions to your inbox."
      };
    }

    // Generate 8-character alphanumeric temp password (e.g., A9D-X3K2)
    const tempPassword = this.generateTempPassword();
    const hash = await argon2.hash(tempPassword);

    // Store in database with 15 minute expiry
    await this.prisma.tempPassword.create({
      data: {
        userId: user.id,
        hash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
    });

    // Send email with temp password
    await this.emailService.sendTempPasswordEmail(user.email, tempPassword);

    // Audit log
    await this.auditService.logTempPasswordRequest(user.id);

    return {
      message: "If this email exists, we've sent instructions to your inbox."
    };
  }

  /**
   * Validate login with temp password and set mustChangePassword flag
   */
  async validateTempPassword(email: string, password: string): Promise<{ user: any; isTempPassword: boolean }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { user: null, isTempPassword: false };
    }

    // First, try regular password
    const isValidRegular = await argon2.verify(user.passwordHash, password);
    if (isValidRegular) {
      return { user, isTempPassword: false };
    }

    // Try temp passwords
    const tempPasswords = await this.prisma.tempPassword.findMany({
      where: {
        userId: user.id,
        expiresAt: { gte: new Date() },
        usedAt: null
      }
    });

    for (const tempPwd of tempPasswords) {
      const isValidTemp = await argon2.verify(tempPwd.hash, password);
      if (isValidTemp) {
        // Mark as used
        await this.prisma.tempPassword.update({
          where: { id: tempPwd.id },
          data: { usedAt: new Date() }
        });

        // Set mustChangePassword flag
        await this.prisma.user.update({
          where: { id: user.id },
          data: { mustChangePassword: true }
        });

        return { user, isTempPassword: true };
      }
    }

    return { user: null, isTempPassword: false };
  }

  /**
   * Force password change after temp password login
   */
  async forceChangePassword(userId: string, dto: ForceChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (!user.mustChangePassword) {
      throw new BadRequestException("Password change not required");
    }

    // Hash new password
    const passwordHash = await argon2.hash(dto.newPassword);

    // Update password and clear flag
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    });

    // Invalidate all temp passwords
    await this.prisma.tempPassword.updateMany({
      where: { userId },
      data: { usedAt: new Date() }
    });

    // Audit log
    await this.auditService.logPasswordChange(userId);

    return {
      message: "Password updated successfully"
    };
  }

  /**
   * Generate 8-character temp password (format: XXX-XXXX)
   */
  private generateTempPassword(): string {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O for clarity
    const bytes = randomBytes(8);
    let password = '';
    
    for (let i = 0; i < 8; i++) {
      password += chars[bytes[i] % chars.length];
      if (i === 2) password += '-'; // Format: XXX-XXXXX
    }
    
    return password;
  }

  /**
   * Test email sending (dev only)
   */
  async testEmail(email: string) {
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: 'VivaForm Test Email 🧪',
        html: `
          <div style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #10b981;">✅ Email Works!</h1>
            <p style="font-size: 18px;">This is a test email from VivaForm backend.</p>
            <p style="color: #6b7280;">Sent at: ${new Date().toISOString()}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #9ca3af;">
              If you received this email, your SMTP configuration is working correctly! 🎉
            </p>
          </div>
        `,
        text: 'Email test successful! If you see this, your SMTP is working.'
      });

      return {
        success: true,
        message: `Test email sent to ${email}. Check Mailtrap inbox!`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // не раскрываем существование
      return { message: 'If this email exists, verification has been sent.' };
    }
    if ((user as any).emailVerified) {
      return { message: 'Email already verified.' };
    }
    const token = await this.jwtService.signAsync(
      { sub: (user as any).id, email: (user as any).email, type: 'email_verification' },
      { secret: this.jwtSettings.secret, expiresIn: '24h' }
    );
    await this.emailService.sendVerificationEmail((user as any).email, token);
    // аудит не обязателен, но можно логировать отдельное действие
    try {
      await this.auditService.logRegistration((user as any).id, (user as any).email);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      this.logger.warn(`audit log registration failed for user=${(user as any).id}: ${reason}`);
    }
    return { message: 'Verification email sent.' };
  }
}
