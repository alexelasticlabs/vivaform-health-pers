import { Injectable, Logger } from "@nestjs/common";
import * as argon2 from "argon2";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
import type { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        mustChangePassword: true,
        emailVerified: true,
        createdAt: true
      }
    });
  }

  async create(data: CreateUserDto) {
    const passwordHash = await argon2.hash(data.password);
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        mustChangePassword: true,
        emailVerified: true,
        createdAt: true
      }
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }

  async verifyEmail(userId: string) {
    // Check if already verified to prevent duplicate verification
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, emailVerifiedAt: true }
    });

    if (user?.emailVerified && user?.emailVerifiedAt) {
      this.logger.warn(`Attempted to verify already verified email for user ${userId}`);
      // Return existing user data instead of throwing error
      return this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tier: true,
          emailVerified: true,
          emailVerifiedAt: true,
          createdAt: true
        }
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        emailVerified: true,
        emailVerifiedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        mustChangePassword: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true
      }
    });
  }
}
