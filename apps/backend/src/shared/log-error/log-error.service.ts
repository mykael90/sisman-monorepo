import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { Prisma } from '@sisman/prisma';

@Injectable()
export class LogErrorService {
  private readonly logger = new Logger(LogErrorService.name);

  constructor(private readonly prisma: PrismaService) {}

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
