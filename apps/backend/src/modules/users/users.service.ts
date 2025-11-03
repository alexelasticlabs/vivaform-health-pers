import { Injectable, Logger } from "@nestjs/common";
import * as argon2 from "argon2";

import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

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
        tier: true,
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
        tier: true,
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
    // TODO: Add emailVerified field to User model in schema.prisma
    this.logger.log(`Email verification requested for user ${userId} - feature pending schema update`);
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
