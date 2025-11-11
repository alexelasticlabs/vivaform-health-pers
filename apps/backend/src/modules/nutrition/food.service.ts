import { Injectable } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";

interface SearchFoodDto {
  query: string;
  category?: string;
  limit?: number;
}

/**
 * FoodService
 *
 * Управление базой продуктов питания с поиском и автодополнением.
 * Поддерживает поиск по названию, бренду, категории.
 */
@Injectable()
export class FoodService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Поиск продуктов по запросу с поддержкой автодополнения
   */
  async searchFoods(dto: SearchFoodDto) {
    const { query, category, limit = 10 } = dto;

    const whereCondition = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { brand: { contains: query, mode: 'insensitive' as const } }
          ]
        },
        category ? { category: { equals: category } } : {}
      ]
    };

    return this.prisma.foodItem.findMany({
      where: whereCondition,
      orderBy: [
        { verified: 'desc' }, // Verified foods first
        { name: 'asc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        caloriesPer100g: true,
        proteinPer100g: true,
        fatPer100g: true,
        carbsPer100g: true,
        fiberPer100g: true,
        sugarPer100g: true,
        servingSize: true,
        servingSizeGrams: true,
        verified: true
      }
    });
  }

  /**
   * Получение продукта по ID
   */
  async getFoodById(id: string) {
    return this.prisma.foodItem.findUnique({
      where: { id }
    });
  }

  /**
   * Получение всех категорий продуктов
   */
  async getCategories() {
    const categories = await this.prisma.foodItem.groupBy({
      by: ['category'],
      orderBy: { category: 'asc' }
    });

    return categories.map(item => item.category);
  }

  /**
   * Создание нового продукта (для админов и пользователей)
   */
  async createFood(data: {
    name: string;
    brand?: string;
    category: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
    fiberPer100g?: number;
    sugarPer100g?: number;
    servingSize: string;
    servingSizeGrams?: number;
    barcode?: string;
    verified?: boolean;
  }) {
    return this.prisma.foodItem.create({
      data
    });
  }

  /**
   * Получение популярных продуктов (на основе частоты использования)
   */
  async getPopularFoods(limit = 20) {
    // Агрегируем по NutritionEntry.food
    const popularByCount = await this.prisma.nutritionEntry.groupBy({
      by: ['food'],
      _count: { food: true },
      orderBy: { _count: { food: 'desc' } },
      take: limit * 2 // запас, т.к. часть может не найтись в FoodItem
    });

    if (popularByCount.length === 0) {
      // Fallback: самые часто встречающиеся проверенные продукты
      return this.prisma.foodItem.findMany({
        where: { verified: true },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });
    }

    // Пытаемся сопоставить FoodItem по имени
    const names = popularByCount.map(p => p.food);
    const items = await this.prisma.foodItem.findMany({
      where: { name: { in: names } }
    });

    // Сортируем по популярности согласно popularByCount
    const orderMap = new Map(popularByCount.map((p, idx) => [p.food, idx] as const));
    const matched = items.sort((a, b) => (orderMap.get(a.name)! - orderMap.get(b.name)!)).slice(0, limit);

    // Если нашли меньше лимита, дозаполним проверенными продуктами
    if (matched.length < limit) {
      const extra = await this.prisma.foodItem.findMany({
        where: { id: { notIn: matched.map(m => m.id) }, verified: true },
        orderBy: { updatedAt: 'desc' },
        take: limit - matched.length
      });
      return [...matched, ...extra];
    }

    return matched;
  }
}