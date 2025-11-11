import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../prisma/prisma.service';

// Ключ метаданных для пометки премиум-эндпоинтов
export const PREMIUM_ONLY_KEY = 'premium_only';

@Injectable()
export class StripeSubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPremiumRequired = this.reflector.get<boolean>(PREMIUM_ONLY_KEY, context.getHandler());
    if (!isPremiumRequired) return true;

    const req = context.switchToHttp().getRequest<any>();
    const user = req?.user;
    if (!user?.id) throw new ForbiddenException('Authentication required');

    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id }, select: { tier: true } });
    if (!dbUser || dbUser.tier !== 'PREMIUM') {
      throw new ForbiddenException('Premium subscription required');
    }

    return true;
  }
}
