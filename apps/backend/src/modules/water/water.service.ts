import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
import { getDayRange } from "../../common/utils/get-day-range";
import type { CreateWaterEntryDto } from "./dto/create-water-entry.dto";

@Injectable()
export class WaterService {
  private readonly logger = new Logger(WaterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWaterEntryDto) {
    const date = dto.date ? new Date(dto.date) : new Date();
    try {
      return await this.prisma.waterEntry.create({
        data: {
          userId,
          date,
          amountMl: dto.amountMl
        }
      });
    } catch (error) {
      this.logger.error(
        `Failed to create water entry for userId=${userId}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new InternalServerErrorException("Не удалось сохранить запись о воде");
    }
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