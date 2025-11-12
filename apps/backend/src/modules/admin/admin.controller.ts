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

  // === Overview ===
  @Get("overview/kpis")
  @ApiOperation({ summary: "Overview KPIs" })
  getOverviewKpis(@Query("from") from?: string, @Query("to") to?: string) {
    return (this.adminService as any).getOverviewKpis(from, to);
  }

  @Get("overview/revenue-trend")
  @ApiOperation({ summary: "Revenue trend (daily)" })
  getRevenueTrend(@Query("from") from?: string, @Query("to") to?: string) {
    return (this.adminService as any).getRevenueTrend(from, to);
  }

  @Get("overview/new-users")
  @ApiOperation({ summary: "New users per day with optional comparison" })
  getNewUsers(@Query("from") from?: string, @Query("to") to?: string, @Query("compare") compare?: string) {
    return (this.adminService as any).getNewUsers(from, to, compare === "1");
  }

  @Get("overview/subscriptions-distribution")
  @ApiOperation({ summary: "Subscriptions distribution" })
  getSubsDistribution() {
    return (this.adminService as any).getSubsDistribution();
  }

  @Get("overview/activity-heatmap")
  @ApiOperation({ summary: "User activity heatmap (weekday x hour)" })
  getActivityHeatmap(@Query("from") from?: string, @Query("to") to?: string) {
    return (this.adminService as any).getActivityHeatmap(from, to);
  }

  @Get("overview/system-health")
  @ApiOperation({ summary: "System health summary" })
  getSystemHealth() {
    return (this.adminService as any).getSystemHealthOverview();
  }

  // === Existing ===
  @Get("users")
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiQuery({ name: "q", required: false, type: String })
  @ApiQuery({ name: "role", required: false, type: String })
  @ApiQuery({ name: "tier", required: false, type: String })
  @ApiQuery({ name: "regFrom", required: false, type: String })
  @ApiQuery({ name: "regTo", required: false, type: String })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortDir", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getAllUsers(
    @Query("q") q?: string,
    @Query("role") role?: string,
    @Query("tier") tier?: string,
    @Query("regFrom") regFrom?: string,
    @Query("regTo") regTo?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortDir") sortDir?: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.adminService.getAllUsersFiltered({ q, role, tier, regFrom, regTo, sortBy, sortDir, page, limit });
  }

  @Get("users/export.csv")
  @ApiOperation({ summary: "Export users CSV with filters" })
  async exportUsersCsv(
    @Query("q") q?: string,
    @Query("role") role?: string,
    @Query("tier") tier?: string,
    @Query("regFrom") regFrom?: string,
    @Query("regTo") regTo?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortDir") sortDir?: string
  ) {
    return (this.adminService as any).exportUsersCsv({ q, role, tier, regFrom, regTo, sortBy, sortDir });
  }

  @Get("users/:id")
  @ApiOperation({ summary: "Get user details (admin)" })
  async getUserDetails(@Param("id") id: string) {
    return (this.adminService as any).getUserDetails(id);
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

  // === Support ===
  @Get('tickets')
  @ApiOperation({ summary: 'List support tickets' })
  listTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignee') assignee?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return (this.adminService as any).listTickets({ status, priority, assignee, page, limit });
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket details' })
  getTicket(@Param('id') id: string) { return (this.adminService as any).getTicket(id); }

  // === Subscriptions ===
  @Get('subs')
  @ApiOperation({ summary: 'List subscriptions' })
  listSubs(
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return (this.adminService as any).listSubscriptions({ status, plan, page, limit });
  }

  // === Support (mutations) ===
  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update ticket fields' })
  updateTicket(@Param('id') id: string, @Body() patch: { status?: string; priority?: string; assignedTo?: string }) {
    return (this.adminService as any).updateTicket(id, patch);
  }

  @Patch('tickets/:id/reply')
  @ApiOperation({ summary: 'Reply to a ticket' })
  replyTicket(@Param('id') id: string, @Body('body') body: string) {
    return (this.adminService as any).replyTicket(id, body);
  }

  // === Settings (mutation) ===
  @Patch('settings')
  @ApiOperation({ summary: 'Patch whitelisted settings' })
  patchSettings(@Body() patch: Record<string, unknown>) { return (this.adminService as any).patchSettings(patch); }
}