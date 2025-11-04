import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseBoolPipe,
  ParseIntPipe
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AdminService } from "./admin.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getAllUsers(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get("stats/users")
  @ApiOperation({ summary: "Get user statistics (admin only)" })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get("stats/system")
  @ApiOperation({ summary: "Get system statistics (admin only)" })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Patch("users/:id/role")
  @ApiOperation({ summary: "Update user role (admin only)" })
  async updateUserRole(@Param("id") userId: string, @Body("role") role: "USER" | "ADMIN") {
    return this.adminService.updateUserRole(userId, role);
  }

  @Get("food-items")
  @ApiOperation({ summary: "Get food items for moderation (admin only)" })
  @ApiQuery({ name: "verified", required: false, type: Boolean })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getFoodItems(
    @Query("verified", new ParseBoolPipe({ optional: true })) verified?: boolean,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.adminService.getFoodItems(verified, page, limit);
  }

  @Patch("food-items/:id/verify")
  @ApiOperation({ summary: "Verify food item (admin only)" })
  async verifyFoodItem(@Param("id") foodId: string, @Body("verified") verified: boolean) {
    return this.adminService.verifyFoodItem(foodId, verified);
  }

  @Delete("food-items/:id")
  @ApiOperation({ summary: "Delete food item (admin only)" })
  async deleteFoodItem(@Param("id") foodId: string) {
    return this.adminService.deleteFoodItem(foodId);
  }
}