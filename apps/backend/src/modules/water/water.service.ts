import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";
import { getDayRange } from "../../common/utils/get-day-range";
import { CreateWaterEntryDto } from "./dto/create-water-entry.dto";

@Injectable()
export class WaterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWaterEntryDto) {
    const date = dto.date ? new Date(dto.date) : new Date();
    return this.prisma.waterEntry.create({
      data: {
        userId,
        date,
        amountMl: dto.amountMl
      }
    });
  }

  async findDaily(userId: string, date?: string) {
    const { start, end } = getDayRange(date);
    return this.prisma.waterEntry.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: "asc" }
    });
  }

  async getDailyTotal(userId: string, date?: string) {
    const entries = await this.findDaily(userId, date);
    return entries.reduce((total, entry) => total + entry.amountMl, 0);
  }
}