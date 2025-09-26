import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common';
import { AuthService } from 'src/shared/auth/auth.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    this.logger.log('AuthGuard triggered');

    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    // console.log(request, authorization);

    try {
      const token = authorization?.split(' ')[1];

      const data = this.authService.checkToken(token);

      console.log(JSON.stringify(data));

      request.tokenPayload = data;

      request.user = {
        id: data.id,
        name: data.name,
        login: data.login,
        email: data.email,
        roles: data.roles
      };

      return true;
    } catch (e) {
      return false;
    }
  }
}
