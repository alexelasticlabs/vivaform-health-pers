import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";

import type { PrismaService } from "../common/prisma/prisma.service";

export type MockPrismaService = DeepMockProxy<PrismaService>;

export const createMockPrismaService = (): MockPrismaService => mockDeep<PrismaService>();