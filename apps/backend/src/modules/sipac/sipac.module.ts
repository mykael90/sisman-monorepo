import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SipacApiService } from './sipac-api.service';
import { MateriaisModule } from './materiais/materiais.module';
import { GruposMateriaisModule } from './grupos-materiais/grupos-materiais.module';
import { SubGruposMateriaisModule } from './subgrupo-materiais/subgrupos-materiais.module';
import { RequisicoesMateriaisModule } from './requisicoes-materiais/requisicoes-materiais.module';
import { RequisicoesManutencoesModule } from './requisicoes-manutencoes/requisicoes-manutencoes.module';
import { SipacScrapingService } from './sipac-scraping.service';
// import { UnidadesModule } from './unidades/unidades.module'; // Exemplo

@Module({
  imports: [
    HttpModule.registerAsync({
      // Configuração assíncrona do HttpModule
      imports: [ConfigModule], // Importa ConfigModule para usar ConfigService
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS', 5)
        // Headers padrão podem ser definidos aqui, mas é melhor no SipacHttpService
        // para incluir lógica de autenticação dinâmica, se necessário.
        // baseURL: configService.get<string>('SIPAC_API_BASE_URL'), // Pode ser aqui ou no service
      }),
      inject: [ConfigService]
    }),
    MateriaisModule,
    GruposMateriaisModule,
    SubGruposMateriaisModule,
    RequisicoesMateriaisModule,
    RequisicoesManutencoesModule // Add the new module
  ],
  providers: [SipacApiService, SipacScrapingService], // Logger pode ser útil aqui também
  exports: [
    SipacApiService,
    SipacScrapingService,
    // Export services from the new module if needed by other modules
    RequisicoesManutencoesModule
  ] // Exporta para uso nos submódulos
})
export class SipacModule {}
