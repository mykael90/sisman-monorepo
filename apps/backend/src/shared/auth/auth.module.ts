import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { FilesModule } from 'src/shared/files/files.module';
import { LogLoginModule } from '../log-login/log-login.module';
import { ObservabilityModule } from '../observability/observability.module';
import { AuthMetricsListener } from './listeners/auth-metrics.listener';
import { AuthLoggingListener } from './listeners/auth-logging.listener';

@Global()
@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    forwardRef(() => UsersModule),
    PrismaModule,
    FilesModule,
    LogLoginModule,
    ObservabilityModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMetricsListener, AuthLoggingListener],
  exports: [AuthService]
})
export class AuthModule {}
