import { Injectable } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";

export interface UserStats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  activeToday: number;
  newThisWeek: number;
}

export interface SystemStats {
  nutritionEntries: number;
  waterEntries: number;
  weightEntries: number;
  recommendations: number;
  foodItems: number;
  mealTemplates: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить список всех пользователей
   */
  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tier: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              nutrition: true,
              water: true,
              weight: true,
              recommendations: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Получить статистику пользователей
   */
  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsers, freeUsers, premiumUsers, newThisWeek] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { tier: "FREE" } }),
      this.prisma.user.count({ where: { tier: "PREMIUM" } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } })
    ]);

    // Приблизительное количество активных пользователей (добавили записи сегодня)
    const activeToday = await this.prisma.user.count({
      where: {
        OR: [
          { nutrition: { some: { createdAt: { gte: todayStart } } } },
          { water: { some: { createdAt: { gte: todayStart } } } },
          { weight: { some: { createdAt: { gte: todayStart } } } }
        ]
      }
    });

    return {
      totalUsers,
      freeUsers,
      premiumUsers,
      activeToday,
      newThisWeek
    };
  }

  /**
   * Получить системную статистику
   */
  async getSystemStats(): Promise<SystemStats> {
    const [nutritionEntries, waterEntries, weightEntries, recommendations, foodItems, mealTemplates] =
      await Promise.all([
        this.prisma.nutritionEntry.count(),
        this.prisma.waterEntry.count(),
        this.prisma.weightEntry.count(),
        this.prisma.recommendation.count(),
        this.prisma.foodItem.count(),
        this.prisma.mealTemplate.count()
      ]);

    return {
      nutritionEntries,
      waterEntries,
      weightEntries,
      recommendations,
      foodItems,
      mealTemplates
    };
  }

  /**
   * Изменить роль пользователя
   */
  async updateUserRole(userId: string, role: "USER" | "ADMIN") {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true
      }
    });
  }

  /**
   * Получить список продуктов для модерации
   */
  async getFoodItems(verified?: boolean, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const where = verified !== undefined ? { verified } : {};

    const [foods, total] = await Promise.all([
      this.prisma.foodItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.foodItem.count({ where })
    ]);

    return {
      foods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Верифицировать продукт
   */
  async verifyFoodItem(foodId: string, verified: boolean) {
    return this.prisma.foodItem.update({
      where: { id: foodId },
      data: { verified }
    });
  }

  /**
   * Удалить продукт
   */
  async deleteFoodItem(foodId: string) {
    return this.prisma.foodItem.delete({
      where: { id: foodId }
    });
  }
}