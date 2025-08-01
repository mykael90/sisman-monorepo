import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { Prisma } from '@sisman/prisma';

@Injectable()
export class LogLoginService {
  private readonly logger = new Logger(LogLoginService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordLoginAttempt(
    data: Prisma.LogLoginCreateWithoutUserInput & { userId: number }
  ): Promise<void> {
    // Extrai userId para usar no connect
    const { userId, ...createData } = data;
    try {
      await this.prisma.logLogin.create({
        data: {
          ...createData,
          user: {
            connect: { id: userId }
          }
        }
      });
    } catch (error) {
      // Logar o erro, mas não necessariamente impedir o fluxo principal
      this.logger.error(
        `Failed to record login attempt for user ${userId}`,
        error
      );
      // Considere mecanismos de retry ou fila se isso for crítico
    }
  }
}
