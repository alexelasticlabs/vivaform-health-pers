import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { NotificationsService } from "./notifications.service";

class RegisterPushTokenDto {
  @IsString()
  @IsNotEmpty()
  pushToken!: string;
}

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("register-device")
  @ApiOperation({ summary: "Регистрация Push Token устройства" })
  async registerDevice(@CurrentUser() user: CurrentUserPayload, @Body() dto: RegisterPushTokenDto) {
    await this.notificationsService.registerPushToken(user.userId, dto.pushToken);
    return { message: "Push token registered successfully" };
  }

  @Post("test-water-reminder")
  @ApiOperation({ summary: "Тестовая отправка напоминания о воде" })
  async testWaterReminder(@CurrentUser() user: CurrentUserPayload) {
    await this.notificationsService.sendWaterReminder(user.userId);
    return { message: "Water reminder sent" };
  }

  @Post("test-weight-reminder")
  @ApiOperation({ summary: "Тестовая отправка напоминания о взвешивании" })
  async testWeightReminder(@CurrentUser() user: CurrentUserPayload) {
    await this.notificationsService.sendWeightTrackingReminder(user.userId);
    return { message: "Weight reminder sent" };
  }
}
