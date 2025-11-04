import { Injectable } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
import { getDayRange } from "../../common/utils/get-day-range";
import type { CreateRecommendationDto } from "./dto/create-recommendation.dto";

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecommendationDto) {
    const date = dto.date ? new Date(dto.date) : new Date();
    return this.prisma.recommendation.create({
      data: {
        userId,
        date,
        title: dto.title,
        body: dto.body
      }
    });
  }

  async findDaily(userId: string, date?: string) {
    const { start, end } = getDayRange(date);
    return this.prisma.recommendation.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findLatest(userId: string, limit = 5) {
    return this.prisma.recommendation.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit
    });
  }
}