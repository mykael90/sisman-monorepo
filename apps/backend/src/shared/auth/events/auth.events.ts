import { User } from '@sisman/prisma';
import { Request as RequestExpress } from 'express';

export class UserLoginAttemptEvent {
  constructor(
    public readonly userId: number | null,
    public readonly ipAddress: string | undefined,
    public readonly userAgent: string | undefined,
    public readonly successful: boolean,
    public readonly error?: any
  ) {}
}

export class UserLoginSuccessEvent {
  constructor(public readonly user: User) {}
}

export class UserLoginFailureEvent {
  constructor(
    public readonly login: string,
    public readonly ipAddress: string | undefined,
    public readonly userAgent: string | undefined,
    public readonly error: any
  ) {}
}

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
