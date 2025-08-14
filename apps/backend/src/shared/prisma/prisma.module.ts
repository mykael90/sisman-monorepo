// src/shared/prisma/prisma.module.ts

import {
  Global,
  Inject,
  Module,
  INestApplication,
  OnModuleInit,
  OnModuleDestroy,
  Injectable
} from '@nestjs/common';
import { PrismaClient } from '@sisman/prisma';

// Importe todas as suas classes de extensão
import { AddMethodsExtension } from './extensions/add-methods-extension';
import { FormatResponseExtension } from './extensions/format-response-extension';
import { AddLogsExtension } from './extensions/add-logs-extension';
// import { ComputedFieldExtension } from './extensions/computed-field-extension';
import { ComputedFieldsMaterialWarehouseStocks } from './computed-fields/material-warehouse-stocks-computed-fields';

// =============================================================================
// PASSO 1: DERIVAR E EXPORTAR O TIPO DO CLIENTE ESTENDIDO
// =============================================================================

// Criamos uma instância temporária do cliente com todas as extensões,
// APENAS para que o TypeScript possa inferir o tipo final e complexo.
const tempPrismaClient = new PrismaClient()
  .$extends(new AddMethodsExtension().exists)
  .$extends(new AddLogsExtension().perfomanceLog)
  .$extends(new ComputedFieldsMaterialWarehouseStocks().physicalOnHandQuantity);
// Adicione outras extensões aqui se necessário

// Este é o tipo que vamos usar para garantir a segurança de tipo.
export type ExtendedPrismaClient = typeof tempPrismaClient;

// =============================================================================
// PASSO 2: CRIAR UMA CLASSE "ALIAS" `PrismaService`
// =============================================================================

@Injectable()
export class PrismaService {
  // O construtor é deixado vazio. O NestJS irá preencher a instância
  // com o que for retornado pelo `useFactory` abaixo.
  // Graças à mágica do `useClass` + `useFactory`, esta classe se torna
  // um alias para nossa instância estendida do PrismaClient.
}

// =============================================================================
// PASSO 3: GERENCIAR O CICLO DE VIDA (CONEXÃO, SHUTDOWN)
// =============================================================================

@Injectable()
export class PrismaLifecycleManager implements OnModuleInit, OnModuleDestroy {
  // Agora injetamos a classe PrismaService, que é o nosso alias.
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  // AGORA OS MÉTODOS FICAM MAIS LIMPOS:
  // Não precisamos mais do "as ExtendedPrismaClient" aqui!
  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}

// =============================================================================
// PASSO 4: DEFINIR O MÓDULO PRISMA
// =============================================================================

@Global()
@Module({
  providers: [
    // 1. Disponibilize todas as classes de extensão para serem injetadas na fábrica.
    AddMethodsExtension,
    FormatResponseExtension,
    AddLogsExtension,
    // ComputedFieldExtension,
    ComputedFieldsMaterialWarehouseStocks,
    PrismaLifecycleManager,

    // 2. O provedor principal que liga a classe `PrismaService` à nossa fábrica.
    {
      provide: PrismaService, // Quando alguém pedir `PrismaService`...
      // Injeta as dependências na fábrica.
      inject: [
        AddMethodsExtension,
        AddLogsExtension,
        ComputedFieldsMaterialWarehouseStocks
      ],
      // ...execute esta fábrica para criar a instância.
      useFactory: (
        addMethodsExtension: AddMethodsExtension,
        addLogsExtension: AddLogsExtension,
        computedFieldsMaterialWarehouseStocks: ComputedFieldsMaterialWarehouseStocks
      ): ExtendedPrismaClient => {
        // A fábrica retorna o tipo estendido
        return new PrismaClient({
          log: ['query', 'info', 'warn', 'error']
        })
          .$extends(addMethodsExtension.exists)
          .$extends(addLogsExtension.perfomanceLog)
          .$extends(
            computedFieldsMaterialWarehouseStocks.physicalOnHandQuantity
          );
      }
    }
  ],
  // Exporta a classe `PrismaService` e o gerenciador de ciclo de vida.
  exports: [PrismaService, PrismaLifecycleManager]
})
export class PrismaModule {}
