import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { CaptureQuizEmailDto } from '../dto/capture-email.dto';

@Injectable()
export class QuizLeadService {
  private readonly logger = new Logger(QuizLeadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async captureLead(payload: CaptureQuizEmailDto, userId?: string) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedClientId = (payload.clientId ?? '').trim();

    try {
      const lead = await (this.prisma as any).quizLead.upsert({
        where: {
          email_clientId: {
            email: normalizedEmail,
            clientId: normalizedClientId,
          },
        },
        update: {
          captureType: payload.type,
          step: payload.step,
          metadata: payload.metadata,
          userId,
        },
        create: {
          email: normalizedEmail,
          clientId: normalizedClientId,
          captureType: payload.type,
          step: payload.step,
          metadata: payload.metadata,
          userId,
        },
      });

      return {
        ok: true,
        leadId: lead.id,
        savedAt: lead.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to capture quiz lead', error instanceof Error ? error.stack : error);
      throw error;
    }
  }
}
