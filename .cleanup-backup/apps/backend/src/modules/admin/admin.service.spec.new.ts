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

  // ... original test file backed up
});
