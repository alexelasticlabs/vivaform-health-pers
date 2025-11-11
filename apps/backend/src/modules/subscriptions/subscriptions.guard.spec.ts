import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { StripeSubscriptionGuard } from '../../common/middleware/stripe-subscription.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

class PrismaMock {
  user = {
    findUnique: vi.fn()
  };
}

describe('StripeSubscriptionGuard', () => {
  let guard: StripeSubscriptionGuard;
  let prisma: PrismaMock;
  let reflector: { get: (metaKey: string, target: any) => any };

  beforeEach(async () => {
    prisma = new PrismaMock();
    reflector = { get: vi.fn() as any } as any;
    guard = new StripeSubscriptionGuard(prisma as unknown as PrismaService, reflector as unknown as Reflector);
  });

  const makeContext = (user: any) => ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({})
  }) as unknown as ExecutionContext;

  it('пропускает маршрут если не отмечен как премиум', async () => {
    (reflector.get as any).mockReturnValue(false);
    const can = await guard.canActivate(makeContext({ id: 'u1' }));
    expect(can).toBe(true);
  });

  it('блокирует если нет пользователя', async () => {
    (reflector.get as any).mockReturnValue(true);
    await expect(guard.canActivate(makeContext(null))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('блокирует если пользователь не премиум', async () => {
    (reflector.get as any).mockReturnValue(true);
    (prisma.user.findUnique as any).mockResolvedValue({ tier: 'FREE' });
    await expect(guard.canActivate(makeContext({ id: 'u1' }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('пропускает если пользователь премиум', async () => {
    (reflector.get as any).mockReturnValue(true);
    (prisma.user.findUnique as any).mockResolvedValue({ tier: 'PREMIUM' });
    const can = await guard.canActivate(makeContext({ id: 'u1' }));
    expect(can).toBe(true);
  });
});
