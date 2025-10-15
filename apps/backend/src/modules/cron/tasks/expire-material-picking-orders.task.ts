import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaterialPickingOrdersService } from '../../material-picking-orders/material-picking-orders.service';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { MaterialPickingOrderStatus } from '@sisman/prisma';

@Injectable()
export class ExpireMaterialPickingOrdersTask {
  private readonly logger = new Logger(ExpireMaterialPickingOrdersTask.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly materialPickingOrdersService: MaterialPickingOrdersService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM) // Executa diariamente às 05 da manhã
  async handleCron() {
    this.logger.debug('Verificar a necessidade de expirar pedidos de retirada');
    // Lógica da tarefa aqui
    const materialsPickingOrdersWaiting =
      await this.prisma.materialPickingOrder.findMany({
        select: {
          id: true,
          desiredPickupDate: true,
          status: true,
          requestedByUserId: true
        },
        where: {
          OR: [
            { status: MaterialPickingOrderStatus.IN_PREPARATION },
            { status: MaterialPickingOrderStatus.READY_FOR_PICKUP }
          ]
        }
      });

    // this.logger.log(materialsPickingOrdersWaiting);

    //marcar como para expirar se data atual - desiredPickupDate > 7 dias
    const materialPickingOrderToExpire = materialsPickingOrdersWaiting.filter(
      (materialPickingOrder) => {
        const desiredPickupDate = new Date(
          materialPickingOrder.desiredPickupDate
        );
        const currentDate = new Date();
        const timeDifference =
          desiredPickupDate.getTime() - currentDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        return daysDifference > 7;
      }
    );

    this.logger.log(
      `Total de ${materialPickingOrderToExpire.length} pedidos para expirar`
    );

    //notificar por email proximidadade para pedido expirar

    //pedidos para expirar
    for (const materialPickingOrder of materialPickingOrderToExpire) {
      await this.materialPickingOrdersService.operationInPickingOrder(
        materialPickingOrder.id,
        materialPickingOrder.requestedByUserId,
        MaterialPickingOrderStatus.EXPIRED
      );
    }

    return;
  }
  //   @Cron('0 0 * * *') // Exemplo: executa todo dia à meia-noite
  //   dailyTask() {
  //     this.logger.log('Tarefa diária executada');
  //   }
}
