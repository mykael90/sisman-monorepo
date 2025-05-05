import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AddMethodsExtension } from './extensions/add-methods-extension';
import { PrismaClientProvider } from './client.provider';
import { FormatResponseExtension } from './extensions/format-response-extension';
import { AddLogsExtension } from './extensions/add-logs-extension';
import { ComputedFieldExtension } from './extensions/computed-field-extension';

@Global()
@Module({
  providers: [
    AddMethodsExtension,
    FormatResponseExtension,
    AddLogsExtension,
    ComputedFieldExtension,
    PrismaClientProvider,
    PrismaService,
  ],
  exports: [PrismaService],
})
export class PrismaModule {
  constructor() {}
}
