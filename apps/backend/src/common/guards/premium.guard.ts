import { Injectable, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guard для проверки наличия активной Premium подписки
 * Используется для защиты эндпоинтов, требующих Premium доступ
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Проверяем tier пользователя
    const userData = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { tier: true }
    });

    if (!userData || userData.tier !== 'PREMIUM') {
      throw new ForbiddenException('Premium subscription required');
    }

    return true;
  }
}
