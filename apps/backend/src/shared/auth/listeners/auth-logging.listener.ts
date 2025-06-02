import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LogLoginService } from '../../log-login/log-login.service';
import { UserLoginAttemptEvent } from '../events/auth.events';

@Injectable()
export class AuthLoggingListener {
  constructor(private readonly logLoginService: LogLoginService) {}

  @OnEvent('user.login.attempt')
  handleUserLoginAttemptEvent(payload: UserLoginAttemptEvent) {
    this.logLoginService
      .recordLoginAttempt({
        userId: payload.userId,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        successful: payload.successful
      })
      .catch((logError) => {
        console.error(
          'Failed background task: recordLoginAttempt from event listener',
          logError
        );
      });
  }
}
