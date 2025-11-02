import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
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
}
