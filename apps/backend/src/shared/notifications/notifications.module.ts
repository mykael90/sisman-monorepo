import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailModule } from './email/email.module';

@Module({
  providers: [NotificationsService],
  imports: [EmailModule]
})
export class NotificationsModule {}
