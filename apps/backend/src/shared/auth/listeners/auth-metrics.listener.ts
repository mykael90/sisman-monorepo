import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MetricsService } from '../../observability/metrics.service';
import {
  UserLoginSuccessEvent,
  UserRegisteredEvent
} from '../events/auth.events';

@Injectable()
export class AuthMetricsListener {
  constructor(private readonly metricsService: MetricsService) {}

  @OnEvent('user.login.success')
  handleUserLoginSuccessEvent(payload: UserLoginSuccessEvent) {
    this.metricsService.userLoginCounter.inc();
  }

  @OnEvent('user.registered')
  handleUserRegisteredEvent(payload: UserRegisteredEvent) {
    this.metricsService.userRegisteredCounter.inc(); // Assuming you have this metric
  }
}
