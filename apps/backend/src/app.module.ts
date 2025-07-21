import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './shared/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MaterialsModule } from './modules/materials/materials.module';
import { FilesModule } from './shared/files/files.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import { LogErrorModule } from './shared/log-error/log-error.module';
import { AllExceptionsFilter } from './shared/exception_filters/all-exception.filter';
import { ObservabilityModule } from './shared/observability/observability.module';
import { MetricsInterceptor } from './shared/interceptors/metrics.interceptor';
import { LogLoginModule } from './shared/log-login/log-login.module';
import { HttpExceptionFilter } from './shared/exception_filters/http-exception.filter';
import { NotificationsModule } from './shared/notifications/notifications.module';
import mailerConfig from './config/mailer.config';
import databaseConfig from './config/database.config';
import generalConfig from './config/general.config';
import { RolesModule } from './modules/roles/roles.module';
import { MaintenanceInstancesModule } from './modules/maintenance-instances/maintenance-instances.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SipacModule } from './modules/sipac/sipac.module';
import { ScheduleModule } from '@nestjs/schedule';
import sipacApiConfig from './config/sipac-api.config';
import sipacScrapingConfig from './config/sipac-scraping.config';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { MaterialRequestsModule } from './modules/material-requests/material-requests.module';
import { StoragesModule } from './modules/storages/storages.module';
import { MaintenanceRequestsModule } from './modules/maintenance-requests/maintenance-requests.module';
import { InfrastructureBuildingsModule } from './modules/infrastructure-buildings/infrastructure-buildings.module';
import { InfrastructureSpaceTypesModule } from './modules/infrastructure-space-types/infrastructure-space-types.module';
import { InfrastructureSpacesModule } from './modules/infrastructure-spaces/infrastructure-spaces.module';
import { InfrastructureSystemsModule } from './modules/infrastructure-systems/infrastructure-systems.module';
import { InfrastructureOccurrenceReinforcementsModule } from './modules/infrastructure-occurrence-reinforcements/infrastructure-occurrence-reinforcements.module';
import { InfrastructureOccurrenceDiagnosisModule } from './modules/infrastructure-occurrence-diagnosis/infrastructure-occurrence-diagnosis.module';
import { MaintenanceServiceTypesModule } from './modules/maintenance-service-types/maintenance-service-types.module';
import { InfrastructureBuildingsActivitiesModule } from './modules/infrastructure-buildings-activities/infrastructure-buildings-activities.module';
import { InfrastructureBuildingTypesModule } from './modules/infrastructure-buildings-types/infrastructure-buildings-types.module';
import { InfrastructureFacilitiesComplexesModule } from './modules/infrastructure-facilities-complexes/infrastructure-facilities-complexes.module';
import { MaterialWarehouseStocksModule } from './modules/material-warehouse-stocks/material-warehouse-stocks.module';
import { MaterialStockMovementTypesModule } from './modules/material-stock-movement-types/material-stock-movement-types.module';
import { MaterialStockMovementsModule } from './modules/material-stock-movements/material-stock-movements.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(), // Adicione esta linha
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        generalConfig,
        mailerConfig,
        databaseConfig,
        sipacApiConfig,
        sipacScrapingConfig
      ],
      expandVariables: true,
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      }
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 200,
          ttl: 60 * 1000
        }
      ],
      ignoreUserAgents: [/Googlebot/gi]
    }),
    ScheduleModule.forRoot(), // Habilita o agendador de tarefas
    LogErrorModule,
    LogLoginModule,
    ObservabilityModule,
    UsersModule,
    RolesModule,
    AuthModule,
    FilesModule,
    MaterialsModule,
    WarehousesModule,
    StoragesModule,
    MaterialRequestsModule,
    NotificationsModule,
    MaintenanceInstancesModule,
    SipacModule,
    MaintenanceRequestsModule,
    InfrastructureBuildingsModule,
    InfrastructureSpaceTypesModule,
    InfrastructureSpacesModule,
    InfrastructureSystemsModule,
    InfrastructureOccurrenceReinforcementsModule,
    InfrastructureOccurrenceDiagnosisModule,
    MaintenanceServiceTypesModule,
    InfrastructureBuildingsActivitiesModule,
    InfrastructureBuildingTypesModule,
    InfrastructureFacilitiesComplexesModule,
    MaterialWarehouseStocksModule,
    MaterialStockMovementTypesModule,
    MaterialStockMovementsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    // Ordem dos Filtros é Importante: Mais específico por último!
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter // 1. Captura qualquer outra exceção que sobrou (fallback)
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter // 2. Tenta capturar HttpExceptions
    },
    // Registre o Interceptor de Métricas Globalmente
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor // <-- Adicione o interceptor aqui
    }
  ],
  exports: [AppService] //dá acesso ao AppService a quem importar o AppModule
})
export class AppModule {}
