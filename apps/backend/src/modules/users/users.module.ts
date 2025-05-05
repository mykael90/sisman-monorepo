import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { UserIdCheckMiddleware } from 'src/shared/middlewares/user-id-check.middleware';
import { AuthModule } from 'src/shared/auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    RolesModule,
    RouterModule.register([
      // Registre a rota filha
      {
        path: 'users', // O caminho base definido no UsersController
        module: UsersModule, // O módulo atual
        children: [
          // Rotas aninhadas sob /users
          {
            path: 'roles', // O segmento de caminho para o módulo filho
            module: RolesModule, // O módulo a ser montado em /users/roles
          },
          // Você pode adicionar mais filhos aqui se necessário
          // { path: 'permissions', module: PermissionsModule },
        ],
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  constructor() {}

  //middleware só para teste
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdCheckMiddleware)
      .exclude(
        // Exclua explicitamente o caminho base do RolesController
        { path: 'users/roles', method: RequestMethod.ALL }, // Ou métodos específicos se necessário
        // Se tiver mais rotas literais sob /users que não têm :id, exclua-as também
        // { path: 'users/some-other-literal-path', method: RequestMethod.GET }
      )
      // Aplique o middleware às rotas restantes que precisam dele.
      // Pode ser pelo controller (mais simples se a maioria das rotas precisa)
      // ou por caminhos específicos.
      .forRoutes({
        path: 'users/:id',
        method: RequestMethod.ALL,
      });
  }
}
