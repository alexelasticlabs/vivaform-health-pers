import { Module } from "@nestjs/common";

import { NotificationsController } from "./notifications.controller";
import { NotificationsCronService } from "./notifications-cron.service";
import { NotificationsService } from "./notifications.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsCronService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
