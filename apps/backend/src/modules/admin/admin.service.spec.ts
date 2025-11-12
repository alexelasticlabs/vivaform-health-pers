import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from './admin.service';

class PrismaMock {
  private rows = [
    { key: 'app.name', value: 'VivaForm' },
    { key: 'secret.smtpPassword', value: 'xxx' }
  ];
  setting = {
    findMany: vi.fn().mockImplementation((args?: any) => {
      if (args?.where?.key?.in) {
        const allow: string[] = args.where.key.in;
        return Promise.resolve(this.rows.filter(r => allow.includes(r.key)) as any);
      }
      return Promise.resolve(this.rows as any);
    }),
    upsert: vi.fn()
  } as any;
}

class StripeMock {}

describe('AdminService settings whitelist', () => {
  let service: AdminService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = new PrismaMock();
    service = new AdminService(prisma as any, new StripeMock() as any);
  });

  it('getSettings returns only whitelisted keys', async () => {
    const res = await service.getSettings();
    expect(res).toHaveProperty('app.name');
    expect((res as any)['secret.smtpPassword']).toBeUndefined();
  });

  it('patchSettings filters non-whitelisted keys', async () => {
    prisma.setting.upsert.mockResolvedValue({});
    const result = await service.patchSettings({ 'app.name': 'New', 'secret.smtpPassword': 'leak' });
    expect(prisma.setting.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.setting.upsert.mock.calls[0][0].where.key).toBe('app.name');
    // getSettings called at the end, findMany respects whitelist
    expect(result).toHaveProperty('app.name');
    expect((result as any)['secret.smtpPassword']).toBeUndefined();
  });
});
