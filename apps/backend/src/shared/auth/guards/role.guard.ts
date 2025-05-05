import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/shared/auth/auth.service';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    this.logger.log('RoleGuard triggered');

    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const { user } = request;

      // Check if the user has AT LEAST ONE of the required roles
      const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

      if (!hasRole) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
