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

    const foods = await this.prisma.foodItem.findMany({
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

    return foods;
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
    // TODO: Реализовать подсчёт по количеству использований в NutritionEntry
    // Пока возвращаем самые популярные категории
    return this.prisma.foodItem.findMany({
      where: {
        verified: true,
        category: {
          in: ['Fruits', 'Vegetables', 'Meat', 'Dairy', 'Grains']
        }
      },
      orderBy: { name: 'asc' },
      take: limit
    });
  }
}