// src/sipac/sipac.module.ts
import { Module, Logger } from '@nestjs/common';
// CacheModule is definitely from @nestjs/cache-manager
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Remove the problematic import:
// import { memoryStore } from 'cache-manager';

import { SipacService } from './sipac.service';
import { SipacController } from './sipac.controller';
import { DefaultParserService } from './html-parser/default-parser.service';
import { ReqMaterialParserService } from './html-parser/req-material-parser.service';
import configParserProvider from './html-parser/config-parser.provider';
import { ReqManutencaoParserService } from './html-parser/req-manutencao-parser.service';
import { ListaManutencaoParserService } from './html-parser/lista-manutencao-parser.service';
import { ListaMaterialParserService } from './html-parser/lista-material-parser.service';
import { ImageParserService } from './html-parser/image-parser.service';
import { GetFileService } from './get-file.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 15000, // Request timeout
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
      }),
      inject: [ConfigService],
    }),
    // Configure CacheModule - Rely on default in-memory store
    CacheModule.registerAsync({
      imports: [ConfigModule],
      // FIX: Simplify - Don't explicitly provide a store factory.
      // @nestjs/cache-manager defaults to in-memory.
      // Just configure TTL and global setting.
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL_SECONDS', 5400) * 1000, // TTL in milliseconds
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Ensure ConfigService is available
  ],
  controllers: [SipacController],
  providers: [
    SipacService,
    DefaultParserService,
    ReqMaterialParserService,
    ReqManutencaoParserService,
    ListaManutencaoParserService,
    ListaMaterialParserService,
    Logger,
    ImageParserService,
    GetFileService,
    // Provider para o Mapa de Parsers
    configParserProvider,
  ],
  exports: [SipacService], // Export if needed elsewhere
})
export class SipacModule {}
