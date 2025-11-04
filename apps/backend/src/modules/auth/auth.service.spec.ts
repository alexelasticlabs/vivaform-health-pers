import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { verify as argonVerify } from "argon2";

import { jwtConfig } from "../../config";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../../common/prisma/prisma.service";

vi.mock("argon2", () => ({
  verify: vi.fn()
}));

const mockJwtSettings: ReturnType<typeof jwtConfig> = {
  secret: "test-secret",
  refreshSecret: "test-refresh-secret",
  accessTokenTtl: 900,
  refreshTokenTtl: 2592000
};

const createJwtService = () => ({
  signAsync: vi.fn((payload: any, options?: any) => Promise.resolve("token")),
  verifyAsync: vi.fn((token: string, options?: any) => Promise.resolve({}))
});

const createUsersService = () => ({
  findByEmail: vi.fn(),
  findById: vi.fn()
});

const createEmailService = () => ({
  sendEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn()
});

const createAuditService = () => ({
  log: vi.fn(),
  logLogin: vi.fn(),
  logRegistration: vi.fn(),
  logPasswordResetRequest: vi.fn(),
  logPasswordReset: vi.fn(),
  logTempPasswordRequest: vi.fn(),
  logPasswordChange: vi.fn()
});

const createPrismaService = () => ({}) as unknown as PrismaService;

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: ReturnType<typeof createUsersService>;
  let jwtService: ReturnType<typeof createJwtService>;
  let emailService: ReturnType<typeof createEmailService>;
  let auditService: ReturnType<typeof createAuditService>;
  let prismaService: PrismaService;

  beforeEach(() => {
    usersService = createUsersService();
    jwtService = createJwtService();
    emailService = createEmailService();
    auditService = createAuditService();
    prismaService = createPrismaService();
    authService = new AuthService(
      prismaService,
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      emailService as any,
      auditService as any,
      mockJwtSettings
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("успешно авторизует пользователя", async () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hash",
      name: "Test",
      tier: "FREE"
    };

    usersService.findByEmail.mockResolvedValue(user);
    (argonVerify as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    jwtService.signAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await authService.login({ email: "test@example.com", password: "password" });

    expect(result.user).toEqual({ id: user.id, email: user.email, name: user.name, tier: "FREE", mustChangePassword: false });
    expect(result.tokens).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" });
    expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("бросает UnauthorizedException при неверных данных", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(authService.login({ email: "nope", password: "secret" })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("обновляет access token по refresh", async () => {
    const payload = { sub: "user-1", email: "test@example.com", type: "refresh" };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const user = {
      id: "user-1",
      email: "test@example.com",
      name: "Test",
      tier: "FREE"
    };
    usersService.findById.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValueOnce("new-access").mockResolvedValueOnce("new-refresh");

    const result = await authService.refresh({ refreshToken: "old" });

    expect(result.tokens.accessToken).toBe("new-access");
    expect(result.tokens.refreshToken).toBe("new-refresh");
    expect(result.user).toEqual(user);
  });

  it("очищает сессию при некорректном refresh token", async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error("invalid"));

    await expect(authService.refresh({ refreshToken: "broken" })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});