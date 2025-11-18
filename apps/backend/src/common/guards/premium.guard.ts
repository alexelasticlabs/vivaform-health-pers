import { Injectable, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Guard для проверки наличия активной Premium подписки
 * Используется для защиты эндпоинтов, требующих Premium доступ
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.tier !== 'PREMIUM') {
      throw new ForbiddenException('Premium subscription required');
    }

    return true;
  }
}
