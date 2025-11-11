import { describe, it, expect } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { StripeSubscriptionGuard, PREMIUM_ONLY_KEY } from './stripe-subscription.guard';

function makeContext(user?: { id?: string }) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user })
    }),
    getHandler: () => ({}),
    getClass: () => ({})
  } as any;
}

describe('StripeSubscriptionGuard', () => {
  it('allows when premium is not required', async () => {
    const prisma = {} as any;
    const reflector = { get: (_key: string) => false } as any;
    const guard = new StripeSubscriptionGuard(prisma, reflector);
    const result = await guard.canActivate(makeContext({ id: 'u1' }));
    expect(result).toBe(true);
  });

  it('throws when no user', async () => {
    const prisma = {} as any;
    const reflector = { get: (_: string) => true } as any;
    const guard = new StripeSubscriptionGuard(prisma, reflector);
    await expect(guard.canActivate(makeContext({}))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when user is not premium', async () => {
    const prisma = { user: { findUnique: async () => ({ tier: 'FREE' }) } } as any;
    const reflector = { get: (_: string) => true } as any;
    const guard = new StripeSubscriptionGuard(prisma, reflector);
    await expect(guard.canActivate(makeContext({ id: 'u1' }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows when user is premium', async () => {
    const prisma = { user: { findUnique: async () => ({ tier: 'PREMIUM' }) } } as any;
    const reflector = { get: (_: string) => true } as any;
    const guard = new StripeSubscriptionGuard(prisma, reflector);
    await expect(guard.canActivate(makeContext({ id: 'u1' }))).resolves.toBe(true);
  });
});

