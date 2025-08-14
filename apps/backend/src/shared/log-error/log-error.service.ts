import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import type { Prisma } from '@sisman/prisma';

@Injectable()
export class LogErrorService {
  private readonly logger = new Logger(LogErrorService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async createLog(data: Prisma.LogErrorCreateInput): Promise<void> {
    try {
      await this.prisma.logError.create({ data });
    } catch (error) {
      // Fallback: Log no console se a escrita no DB falhar
      this.logger.error('Failed to save error log to database', error);
      this.logger.error('Original Error Data:', JSON.stringify(data));
    }
  }
}
