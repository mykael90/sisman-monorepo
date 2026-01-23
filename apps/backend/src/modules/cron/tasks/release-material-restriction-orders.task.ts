import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { MaterialRestrictionOrdersService } from '../../material-restriction-orders/material-restriction-orders.service';
import { RestrictionOrderStatus } from '@sisman/prisma';
import { handlePrismaError } from '../../../shared/utils/prisma-error-handler';
import { RequisicoesManutencoesService } from '../../sipac/requisicoes-manutencoes/requisicoes-manutencoes.service';

@Injectable()
export class ReleaseMaterialRestrictionOrdersTask {
  private readonly logger = new Logger(
    ReleaseMaterialRestrictionOrdersTask.name
  );

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly requisicoesManutencoesService: RequisicoesManutencoesService,
    private readonly materialRestrictionOrdersService: MaterialRestrictionOrdersService
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_5AM) // Executa diariamente às 05 da manhã
  // @Cron(CronExpression.EVERY_MINUTE) // Exemplo: executa a cada MINUTO
  @Cron(CronExpression.EVERY_DAY_AT_4AM) // Executa diariamente às 04 da manhã
  async handleCron() {
    this.logger.debug(
      'Verificar a necessidade de liberar restrições de requisições de materiais'
    );

    // Data limite: 30 dias atrás
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    try {
      const maintenanceRequestsWithRestrictionsToUpdate =
        await this.prisma.materialRestrictionOrder.findMany({
          select: {
            id: true,
            status: true,
            targetMaterialRequest: {
              select: {
                id: true,
                protocolNumber: true,
                requestDate: true,
                maintenanceRequest: {
                  select: {
                    id: true,
                    protocolNumber: true,
                    completedAt: true,
                    updatedAt: true,
                    requestedAt: true
                  }
                }
              }
            }
          },
          orderBy: {
            targetMaterialRequest: {
              requestDate: 'desc'
            }
          },
          where: {
            AND: {
              status: {
                not: RestrictionOrderStatus.FREE
              },
              targetMaterialRequest: {
                maintenanceRequest: {
                  // Apenas registros que NÃO foram atualizados nos últimos 30 dias
                  updatedAt: {
                    lt: thirtyDaysAgo
                  }
                }
              }
            }
          }
        });

      this.logger.log(
        `Retornando ${maintenanceRequestsWithRestrictionsToUpdate.length} materialRestrictionOrders.`
      );

      // Sincronizar as requisições retornadas com o SIPAC
      const protocolNumberArray =
        maintenanceRequestsWithRestrictionsToUpdate.map(
          (maintenanceRequest) =>
            maintenanceRequest.targetMaterialRequest.maintenanceRequest
              .protocolNumber
        );

      this.logger.log(`Array dos protocolos: ${protocolNumberArray}`);

      //Chamar método para sincronizar
      await this.requisicoesManutencoesService.fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencaoArray(
        protocolNumberArray
      );

      this.logger.log(`Sincronização concluída.`);

      const materialRequestsToRelease =
        await this.prisma.materialRestrictionOrder.findMany({
          select: {
            id: true,
            status: true,
            targetMaterialRequest: {
              select: {
                id: true,
                protocolNumber: true,
                requestDate: true,
                maintenanceRequest: {
                  select: {
                    id: true,
                    protocolNumber: true,
                    completedAt: true,
                    updatedAt: true,
                    requestedAt: true
                  }
                }
              }
            },
            items: {
              select: {
                id: true,
                quantityRestricted: true,
                globalMaterial: true,
                materialInstance: true,
                targetMaterialRequestItem: true
              },
              where: {
                quantityRestricted: {
                  gt: 0
                }
              }
            }
          },
          orderBy: {
            targetMaterialRequest: {
              requestDate: 'desc'
            }
          },
          where: {
            AND: {
              status: {
                not: RestrictionOrderStatus.FREE
              },
              targetMaterialRequest: {
                maintenanceRequest: {
                  completedAt: {
                    not: null
                  }
                }
              }
            }
          }
        });

      this.logger.log(
        `Retornando ${materialRequestsToRelease.length} materialRestrictionOrders.`
      );

      for (const materialRestrictionOrder of materialRequestsToRelease) {
        this.logger.log(`Liberando ${materialRestrictionOrder.id}.`);

        await this.materialRestrictionOrdersService.update(
          materialRestrictionOrder.id,
          {
            notes: `Liberação automática realizada em ${new Date().toISOString()}`,
            items: materialRestrictionOrder.items.map(
              (item) =>
                ({
                  id: item.id,
                  globalMaterialId: item.globalMaterial.id,
                  quantityRestricted: 0,
                  targetMaterialRequestItemId: item.targetMaterialRequestItem.id
                }) as any
            )
          }
        );
      }

      this.logger.log(`Liberação concluída.`);

      return;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'listWithRestrictions'
      });
      throw error;
    }
  }
}
