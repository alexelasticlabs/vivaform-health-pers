import { Injectable } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
import { getDayRange } from "../../common/utils/get-day-range";
import type { CreateNutritionEntryDto } from "./dto/create-nutrition-entry.dto";

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNutritionEntryDto) {
    const date = dto.date ? new Date(dto.date) : new Date();
    return this.prisma.nutritionEntry.create({
      data: {
        userId,
        date,
        mealType: dto.mealType,
        food: dto.food,
        calories: dto.calories,
        protein: dto.protein,
        fat: dto.fat,
        carbs: dto.carbs
      }
    });
  }

  async findDaily(userId: string, date?: string) {
    const { start, end } = getDayRange(date);
    return this.prisma.nutritionEntry.findMany({
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

  async getDailySummary(userId: string, date?: string) {
    const entries = await this.findDaily(userId, date);

    return entries.reduce(
      (acc, entry) => {
        acc.calories += entry.calories;
        acc.protein += entry.protein;
        acc.fat += entry.fat;
        acc.carbs += entry.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  }
}