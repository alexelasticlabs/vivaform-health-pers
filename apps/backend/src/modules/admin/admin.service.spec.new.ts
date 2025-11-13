import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

describe('AdminService - Feature Toggles & Audit Logs', () => {
  let service: AdminService;
  let prisma: DeepMockProxy<PrismaService>;
  let stripe: DeepMockProxy<StripeService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    stripe = mockDeep<StripeService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: StripeService, useValue: stripe },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('Feature Toggles', () => {
    describe('listFeatureToggles', () => {
      it('should return list of all feature toggles', async () => {
        // Arrange
        const mockToggles = [
          {
            id: '1',
            key: 'new_quiz_flow',
            enabled: true,
            rolloutPercent: 50,
            description: 'New quiz with branching',
            metadata: null,
            createdBy: null,
            createdAt: new Date('2025-01-13'),
            updatedAt: new Date('2025-01-13'),
          },
          {
            id: '2',
            key: 'premium_upsell',
            enabled: false,
            rolloutPercent: 0,
            description: 'Premium feature upsell',
            metadata: { targetAudience: 'free_users' },
            createdBy: null,
            createdAt: new Date('2025-01-13'),
            updatedAt: new Date('2025-01-13'),
          },
        ];

        prisma.featureToggle.findMany.mockResolvedValue(mockToggles as any);

        // Act
        const result = await service.listFeatureToggles();

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].key).toBe('new_quiz_flow');
        expect(result[0].enabled).toBe(true);
        expect(result[0].rolloutPercent).toBe(50);
        expect(result[1].key).toBe('premium_upsell');
        expect(prisma.featureToggle.findMany).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' },
        });
      });

      it('should return empty array when no toggles exist', async () => {
        prisma.featureToggle.findMany.mockResolvedValue([]);
        const result = await service.listFeatureToggles();
        expect(result).toEqual([]);
      });
    });

    describe('getFeatureToggle', () => {
      it('should return specific feature toggle by key', async () => {
        const mockToggle = {
          id: '1',
          key: 'new_quiz_flow',
          enabled: true,
          rolloutPercent: 75,
          description: 'Enhanced quiz',
          metadata: { version: 2 },
          createdBy: null,
          createdAt: new Date('2025-01-13'),
          updatedAt: new Date('2025-01-13'),
        };

        prisma.featureToggle.findUnique.mockResolvedValue(mockToggle as any);

        const result = await service.getFeatureToggle('new_quiz_flow');

        expect(result.key).toBe('new_quiz_flow');
        expect(result.rolloutPercent).toBe(75);
        expect(prisma.featureToggle.findUnique).toHaveBeenCalledWith({
          where: { key: 'new_quiz_flow' },
        });
      });

      it('should throw error when toggle not found', async () => {
        prisma.featureToggle.findUnique.mockResolvedValue(null);
        await expect(service.getFeatureToggle('non_existent')).rejects.toThrow('Feature toggle non_existent not found');
      });
    });

    describe('updateFeatureToggle', () => {
      it('should create new toggle if not exists', async () => {
        prisma.featureToggle.findUnique.mockResolvedValue(null);
        const mockCreated = {
          id: '1',
          key: 'new_feature',
          enabled: true,
          rolloutPercent: 10,
          description: 'New feature',
          metadata: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        prisma.featureToggle.create.mockResolvedValue(mockCreated as any);

        const result = await service.updateFeatureToggle('new_feature', {
          enabled: true,
          rolloutPercent: 10,
          description: 'New feature',
        });

        expect(result.key).toBe('new_feature');
        expect(result.enabled).toBe(true);
        expect(prisma.featureToggle.create).toHaveBeenCalledWith({
          data: {
            key: 'new_feature',
            enabled: true,
            rolloutPercent: 10,
            description: 'New feature',
            metadata: undefined,
          },
        });
      });

      it('should update existing toggle', async () => {
        const existing = {
          id: '1',
          key: 'existing_feature',
          enabled: false,
          rolloutPercent: 0,
          description: 'Old description',
          metadata: null,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        prisma.featureToggle.findUnique.mockResolvedValue(existing as any);

        const updated = { ...existing, enabled: true, rolloutPercent: 50 };
        prisma.featureToggle.update.mockResolvedValue(updated as any);

        const result = await service.updateFeatureToggle('existing_feature', {
          enabled: true,
          rolloutPercent: 50,
        });

        expect(result.enabled).toBe(true);
        expect(result.rolloutPercent).toBe(50);
        expect(prisma.featureToggle.update).toHaveBeenCalledWith({
          where: { key: 'existing_feature' },
          data: {
            enabled: true,
            rolloutPercent: 50,
            description: existing.description,
            metadata: existing.metadata,
          },
        });
      });
    });
  });

  describe('Audit Logs', () => {
    describe('getAuditLogs', () => {
      it('should return paginated audit logs', async () => {
        const mockLogs = [
          {
            id: '1',
            userId: 'admin1',
            action: 'user.role_changed',
            entity: 'user',
            entityId: 'user123',
            metadata: { oldRole: 'USER', newRole: 'ADMIN' },
            createdAt: new Date('2025-01-13T10:00:00Z'),
            User: { email: 'admin@example.com' },
          },
          {
            id: '2',
            userId: 'admin1',
            action: 'feature_toggle.updated',
            entity: 'feature_toggle',
            entityId: 'toggle1',
            metadata: { enabled: true },
            createdAt: new Date('2025-01-13T09:00:00Z'),
            User: { email: 'admin@example.com' },
          },
        ];

        prisma.auditLog.findMany.mockResolvedValue(mockLogs as any);
        prisma.auditLog.count.mockResolvedValue(2);

        const result = await service.getAuditLogs({ page: 1, limit: 10 });

        expect(result.logs).toHaveLength(2);
        expect(result.total).toBe(2);
        expect(result.page).toBe(1);
        expect(result.logs[0].action).toBe('user.role_changed');
        expect(result.logs[0].actorEmail).toBe('admin@example.com');
      });

      it('should filter logs by action', async () => {
        prisma.auditLog.findMany.mockResolvedValue([]);
        prisma.auditLog.count.mockResolvedValue(0);

        await service.getAuditLogs({ action: 'user.updated', page: 1, limit: 10 });

        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
          where: { action: 'user.updated' },
          include: { User: { select: { email: true } } },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        });
      });

      it('should filter logs by entity', async () => {
        prisma.auditLog.findMany.mockResolvedValue([]);
        prisma.auditLog.count.mockResolvedValue(0);

        await service.getAuditLogs({ entity: 'user', page: 1, limit: 10 });

        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
          where: { entity: 'user' },
          include: { User: { select: { email: true } } },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        });
      });

      it('should handle pagination correctly', async () => {
        prisma.auditLog.findMany.mockResolvedValue([]);
        prisma.auditLog.count.mockResolvedValue(100);

        const result = await service.getAuditLogs({ page: 3, limit: 25 });

        expect(result.page).toBe(3);
        expect(result.limit).toBe(25);
        expect(result.pages).toBe(4); // Math.ceil(100 / 25)
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
          where: {},
          include: { User: { select: { email: true } } },
          orderBy: { createdAt: 'desc' },
          skip: 50, // (3 - 1) * 25
          take: 25,
        });
      });
    });

    describe('createAuditLog', () => {
      it('should create audit log entry', async () => {
        const mockLog = {
          id: '1',
          userId: 'admin1',
          action: 'user.role_changed',
          entity: 'user',
          entityId: 'user123',
          metadata: { oldRole: 'USER', newRole: 'ADMIN' },
          createdAt: new Date(),
        };

        prisma.auditLog.create.mockResolvedValue(mockLog as any);

        await service.createAuditLog(
          'admin1',
          'user.role_changed',
          'user',
          'user123',
          { oldRole: 'USER', newRole: 'ADMIN' }
        );

        expect(prisma.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin1',
            action: 'user.role_changed',
            entity: 'user',
            entityId: 'user123',
            metadata: { oldRole: 'USER', newRole: 'ADMIN' },
          },
        });
      });

      it('should handle null userId (system actions)', async () => {
        prisma.auditLog.create.mockResolvedValue({} as any);

        await service.createAuditLog(null, 'system.cleanup', 'user', null);

        expect(prisma.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: null,
            action: 'system.cleanup',
            entity: 'user',
            entityId: null,
            metadata: undefined,
          },
        });
      });
    });
  });
});

