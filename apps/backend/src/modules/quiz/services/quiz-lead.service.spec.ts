import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizLeadService } from './quiz-lead.service';
import type { CaptureQuizEmailDto } from '../dto/capture-email.dto';
import { QuizLeadCaptureType } from '../dto/capture-email.dto';

const updatedAt = new Date('2025-01-15T00:00:00.000Z');

function createPrismaMock() {
  return {
    quizLead: {
      upsert: vi.fn(),
    },
  } as unknown as {
    quizLead: {
      upsert: ReturnType<typeof vi.fn>;
    };
  };
}

describe('QuizLeadService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: QuizLeadService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new QuizLeadService(prisma as any);
  });

  it('captures lead with normalized fields and returns payload', async () => {
    const payload: CaptureQuizEmailDto = {
      email: ' USER@example.com ',
      clientId: ' client-123 ',
      type: QuizLeadCaptureType.MIDPOINT,
      step: 9,
      metadata: { foo: 'bar' },
    };

    (prisma.quizLead.upsert as any).mockResolvedValue({
      id: 'lead-1',
      updatedAt,
    });

    const result = await service.captureLead(payload, 'user-1');

    expect(prisma.quizLead.upsert).toHaveBeenCalledWith({
      where: {
        email_clientId: {
          email: 'user@example.com',
          clientId: 'client-123',
        },
      },
      update: {
        captureType: QuizLeadCaptureType.MIDPOINT,
        step: 9,
        metadata: { foo: 'bar' },
        userId: 'user-1',
      },
      create: {
        email: 'user@example.com',
        clientId: 'client-123',
        captureType: QuizLeadCaptureType.MIDPOINT,
        step: 9,
        metadata: { foo: 'bar' },
        userId: 'user-1',
      },
    });

    expect(result).toEqual({
      ok: true,
      leadId: 'lead-1',
      savedAt: updatedAt.toISOString(),
    });
  });

  it('falls back to empty clientId and rethrows errors', async () => {
    const payload: CaptureQuizEmailDto = {
      email: 'lead@example.com',
    };
    const error = new Error('DB down');
    const loggerSpy = vi.spyOn((service as any).logger, 'error');
    (prisma.quizLead.upsert as any).mockRejectedValue(error);

    await expect(service.captureLead(payload)).rejects.toThrow(error);

    expect(prisma.quizLead.upsert).toHaveBeenCalledWith({
      where: {
        email_clientId: {
          email: 'lead@example.com',
          clientId: '',
        },
      },
      update: {
        captureType: undefined,
        step: undefined,
        metadata: undefined,
        userId: undefined,
      },
      create: {
        email: 'lead@example.com',
        clientId: '',
        captureType: undefined,
        step: undefined,
        metadata: undefined,
        userId: undefined,
      },
    });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Failed to capture quiz lead',
      error.stack,
    );
  });
});
