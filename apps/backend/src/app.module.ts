import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './shared/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { MaterialsModule } from './modules/materials/materials.module';
import { FilesModule } from './shared/files/files.module';
import { ConfigModule } from '@nestjs/config';
import mailerConfig from './config/mailer.config';
import { validationSchema } from './config/validation.schema';
import { LogErrorModule } from './shared/log-error/log-error.module';
import { AllExceptionsFilter } from './shared/exception_filters/all-exception.filter';
import { ObservabilityModule } from './shared/observability/observability.module';
import { MetricsInterceptor } from './shared/interceptors/metrics.interceptor';
import { LogLoginModule } from './shared/log-login/log-login.module';
import { HttpExceptionFilter } from './shared/exception_filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [mailerConfig],
      validationSchema,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 100,
          ttl: 60 * 1000,
        },
      ],
      ignoreUserAgents: [/Googlebot/gi],
    }),
    LogErrorModule,
    LogLoginModule,
    ObservabilityModule,
    UsersModule,
    AuthModule,
    FilesModule,
    MailerModule.forRootAsync({
      useFactory: mailerConfig,
    }),
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Ordem dos Filtros é Importante: Mais específico por último!
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // 1. Captura qualquer outra exceção que sobrou (fallback)
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // 2. Tenta capturar HttpExceptions
    },
    // Registre o Interceptor de Métricas Globalmente
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor, // <-- Adicione o interceptor aqui
    },
  ],
  exports: [AppService], //dá acesso ao AppService a quem importar o AppModule
})
export class AppModule {}
