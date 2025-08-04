import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from 'src/shared/auth/auth.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
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

      //criar o objeto user no request diretamente das informações do token para não precisar consultar no banco de dados
      request.user = {
        id: data.id,
        name: data.name,
        login: data.login,
        email: data.email,
        roles: data.roles,
      };

      // abaixo está se fosse pegar do banco as informações do user
      // request.user = await this.userService.show(data.id);

      //log no console dos nomes das chaves, seus valores e tipos
      // for (const key in data) {
      //   console.log(
      //     `key: ${key}, value: ${data[key]}, type: ${typeof data[key]}`,
      //   );
      // }

      return true;
    } catch (e) {
      return false;
    }
  }
}
