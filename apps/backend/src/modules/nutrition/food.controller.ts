import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Transform } from "class-transformer";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FoodService } from "./food.service";

class SearchFoodsQueryDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

@ApiTags("nutrition/foods")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("nutrition/foods")
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get("search")
  @ApiOperation({ summary: "Поиск продуктов для автодополнения" })
  @ApiQuery({ name: "query", description: "Поисковый запрос (название или бренд)" })
  @ApiQuery({ name: "category", required: false, description: "Фильтр по категории" })
  @ApiQuery({ name: "limit", required: false, description: "Максимум результатов (1-50)", type: Number })
  async searchFoods(@Query() query: SearchFoodsQueryDto) {
    const foods = await this.foodService.searchFoods({
      query: query.query,
      category: query.category,
      limit: query.limit
    });
    
    // Wrap response to match frontend expectations
    return {
      foods,
      totalCount: foods.length
    };
  }

  @Get("categories")
  @ApiOperation({ summary: "Получить все категории продуктов" })
  async getCategories() {
    return this.foodService.getCategories();
  }

  @Get("popular")
  @ApiOperation({ summary: "Популярные продукты" })
  async getPopular() {
    return this.foodService.getPopularFoods();
  }
}