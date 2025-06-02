import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailModule } from './email/email.module';
import { EmailNotificationListener } from './listeners/email-notification.listener';

@Module({
  providers: [NotificationsService, EmailNotificationListener],
  imports: [EmailModule]
})
export class NotificationsModule {}
