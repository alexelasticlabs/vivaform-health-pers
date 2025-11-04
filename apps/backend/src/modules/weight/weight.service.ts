import { Injectable } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
import { getDayRange } from "../../common/utils/get-day-range";
import type { CreateWeightEntryDto, WeightQueryDto } from "./dto/create-weight-entry.dto";

@Injectable()
export class WeightService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWeightEntryDto) {
    const date = dto.date ? new Date(dto.date) : new Date();
    return this.prisma.weightEntry.create({
      data: {
        userId,
        date,
        weightKg: dto.weightKg,
        note: dto.note
      }
    });
  }

  async getLatest(userId: string) {
    return this.prisma.weightEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" }
    });
  }

  private buildDateFilter(query: WeightQueryDto) {
    if (query.date) {
      const { start, end } = getDayRange(query.date);
      return { gte: start, lte: end } as const;
    }

    const range: { gte?: Date; lte?: Date } = {};
    if (query.from) {
      range.gte = new Date(query.from);
    }
    if (query.to) {
      range.lte = new Date(query.to);
    }

    return Object.keys(range).length > 0 ? range : undefined;
  }

  async getHistory(userId: string, query: WeightQueryDto) {
    const dateFilter = this.buildDateFilter(query);
    const limit = query.limit ?? 30;

    return this.prisma.weightEntry.findMany({
      where: {
        userId,
        ...(dateFilter ? { date: dateFilter } : {})
      },
      orderBy: { date: "desc" },
      take: limit
    });
  }

  async getProgress(userId: string, query: WeightQueryDto) {
    const entries = await this.getHistory(userId, { ...query, limit: query.limit ?? 30 });
    if (entries.length === 0) {
      return { delta: 0, start: null, end: null };
    }

    const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    return {
      delta: Number((end.weightKg - start.weightKg).toFixed(2)),
      start,
      end
    };
  }
}