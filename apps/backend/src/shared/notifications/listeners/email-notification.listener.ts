import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { SendEmailEvent } from '../events/notification.events';

@Injectable()
export class EmailNotificationListener {
  private readonly logger = new Logger(EmailNotificationListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent('send.email')
  async handleSendEmailEvent(payload: SendEmailEvent) {
    try {
      await this.emailService.sendEmail(
        payload.to,
        payload.subject,
        payload.template,
        payload.context
      );
      this.logger.log(
        `Email sent to ${payload.to} for template ${payload.template}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${payload.to} for template ${payload.template}: ${error.message}`,
        error.stack
      );
    }
  }
}
