import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger
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
        [context.getHandler(), context.getClass()]
      );

      if (!requiredRoles) {
        return true; //se a rota não tem nenhuma exigência deixe passar
      }

      const request = context.switchToHttp().getRequest();
      const { user } = request;

      // Check if the user has AT LEAST ONE of the required roles
      const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

      if (!hasRole) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar esse recurso.'
        );
      }

      return true;
    } catch (e) {
      throw e;
    }
  }
}
