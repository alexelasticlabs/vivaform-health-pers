import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { ArticleService } from "./article.service";
import { CreateArticleDto, UpdateArticleDto } from "./dto/article.dto";

@ApiTags("articles")
@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @ApiOperation({ summary: "Get published articles" })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getPublishedArticles(
    @Query("category") category?: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.articleService.getPublishedArticles(category, page, limit);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get article categories" })
  async getCategories() {
    return this.articleService.getCategories();
  }

  @Get("all")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Get all articles including drafts (admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getAllArticles(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.articleService.getAllArticles(page, limit);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get article by slug" })
  async getArticleBySlug(@Param("slug") slug: string) {
    return this.articleService.getArticleBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create article (admin only)" })
  async createArticle(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articleService.createArticle(req.user.userId, createArticleDto);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update article (admin only)" })
  async updateArticle(@Param("id") id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.updateArticle(id, updateArticleDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Delete article (admin only)" })
  async deleteArticle(@Param("id") id: string) {
    return this.articleService.deleteArticle(id);
  }
}