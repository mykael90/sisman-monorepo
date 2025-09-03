import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  ConflictException
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateMaterialReceiptWithRelationsDto,
  UpdateMaterialReceiptWithRelationsDto,
  MaterialReceiptWithRelationsResponseDto
} from './dto/material-receipt.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  Prisma,
  MaterialReceiptStatus,
  MaterialStockOperationSubType
} from '@sisman/prisma';
import { MaterialStockMovementsService } from '../material-stock-movements/material-stock-movements.service';
import {
  CreateMaterialStockMovementDto,
  CreateMaterialStockMovementWithRelationsDto
} from '../material-stock-movements/dto/material-stock-movements.dto';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';
import { CreateMaterialRestrictionOrderWithRelationsDto } from '../material-restriction-orders/dto/material-restriction-order.dto';
import { MaterialRestrictionOrdersService } from '../material-restriction-orders/material-restriction-orders.service';

@Injectable()
export class MaterialReceiptsService {
  private readonly logger = new Logger(MaterialReceiptsService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly materialStockMovementsService: MaterialStockMovementsService,
    private readonly materialRestrictionOrdersService: MaterialRestrictionOrdersService
  ) {}

  private readonly includeRelations: Prisma.MaterialReceiptInclude = {
    movementType: true,
    destinationWarehouse: true,
    processedByUser: true,
    items: true,
    materialRequest: {
      include: {
        items: true
      }
    }
  };

  async create(
    data: CreateMaterialReceiptWithRelationsDto
  ): Promise<MaterialReceiptWithRelationsResponseDto> {
    const {
      movementType,
      destinationWarehouse,
      processedByUser,
      materialRequest,
      items,
      ...restOfData
    } = data;

    //Verificar se a entrada é "IN_CENTRAL", em caso positivo, verificar se ja existe um recebimento referente a essa requisicao de material, caso ja exista lance um erro de conflito
    if (movementType?.code === MaterialStockOperationSubType.IN_CENTRAL) {
      const existingReceipt = await this.prisma.materialReceipt.findFirst({
        where: {
          materialRequestId: materialRequest?.id,
          destinationWarehouseId: destinationWarehouse?.id
        }
      });
      if (existingReceipt) {
        throw new ConflictException(
          `Já existe um recebimento para essa requisição de material.`
        );
      }
    }

    const receiptCreateInput: Prisma.MaterialReceiptCreateInput = {
      ...restOfData,
      movementType: movementType?.code
        ? { connect: { code: movementType.code } }
        : undefined,
      destinationWarehouse: destinationWarehouse?.id
        ? { connect: { id: destinationWarehouse.id } }
        : undefined,
      processedByUser: processedByUser?.id
        ? { connect: { id: processedByUser.id } }
        : undefined,
      materialRequest: materialRequest?.id
        ? { connect: { id: materialRequest.id } }
        : undefined,
      items: {
        create: items.map((item) => ({
          // Mapeie os campos do DTO para o modelo do Prisma
          // Remova quaisquer campos que não pertençam a MaterialReceiptItem
          materialId: item.materialId,
          unitPrice: item.unitPrice,
          quantityExpected: item.quantityExpected,
          quantityReceived: item.quantityReceived,
          // quantityAccepted: item.quantityAccepted,
          quantityRejected: item.quantityRejected,
          materialRequestItemId: item.materialRequestItemId,
          batchNumber: item.batchNumber,
          expirationDate: item.expirationDate,
          rejectionReason: item.rejectionReason
          //TODO: Adicionar campos restantes
          // Adicione outros campos de MaterialReceiptItem aqui, se houver
        }))
      }
    };
    try {
      this.logger.log(`Iniciando transação para recebimento de material...`);
      const createdReceipt = await this.prisma.$transaction(async (tx) => {
        // ETAPA 1: Criar o Recebimento de Entrada Material e seus Itens.

        //realizar um reduce para calcular o valor da entrada baseado na quantidade e valor unitario dos items
        const valueReceipt = items.reduce<Decimal | undefined>(
          (total, item) => {
            if (!item.unitPrice) return undefined;

            const quantity = new Decimal(item.quantityReceived);
            const unitPrice = new Decimal(item.unitPrice);

            if (total === undefined) return quantity.times(unitPrice);

            return total.plus(quantity.times(unitPrice));
          },
          new Decimal(0)
        );

        receiptCreateInput.valueReceipt = valueReceipt;

        // O 'include' garante que 'newReceipt.items' conterá os itens com seus IDs.
        const newReceipt = await tx.materialReceipt.create({
          data: receiptCreateInput,
          include: {
            items: true, // Crucial para obter os IDs dos itens
            materialRequest: true
          }
        });

        this.logger.log(
          `Recebimento de material nº ${newReceipt.id} e seus ${newReceipt.items.length} itens criados.`
        );

        this.logger.log(`Iniciando criação das movimentações de estoque...`);

        // ETAPA 2: Iterar sobre CADA item criado para gerar a movimentação de estoque.
        for (const createdItem of newReceipt.items) {
          // Ignorar itens que não foram aceitos
          if (createdItem.quantityReceived.isZero()) {
            this.logger.log(
              `Item ${createdItem.id} com quantidade aceita 0, pulando movimentação.`
            );
            continue;
          }

          const materialStockMovement: CreateMaterialStockMovementWithRelationsDto =
            {
              quantity: createdItem.quantityReceived,
              unitPrice: createdItem.unitPrice,
              globalMaterial: { id: createdItem.materialId } as any,
              warehouse: { id: destinationWarehouse.id } as any,
              movementType: { code: movementType.code } as any,
              processedByUser: { id: processedByUser.id } as any,
              // AQUI ESTÁ A MÁGICA: Usamos o ID do item que acabamos de criar.
              materialReceiptItem: { id: createdItem.id } as any,
              // Conectar à requisição de manutenção, se existir
              materialRequestItem: {
                id: createdItem.materialRequestItemId
              } as any,
              maintenanceRequest: newReceipt.materialRequest
                ?.maintenanceRequestId
                ? ({
                    id: newReceipt.materialRequest.maintenanceRequestId
                  } as any)
                : undefined
            };

          // Chama o serviço de movimentação, passando o cliente da transação (tx)
          await this.materialStockMovementsService.create(
            materialStockMovement,
            tx as any
          );
          this.logger.log(
            `Movimentação para o item ${createdItem.id} criada com sucesso.`
          );
        }

        this.logger.log(`Todas as movimentações de estoque foram criadas.`);

        //ETAPA 3: Restringir os items para saida generica se for uma entrada do tipo "IN_CENTRAL", tiver uma requisição de manutenção associada, e essa requisicao de manutencao já ter alguma reserva ou retirada. Ou seja, a requisicao de manutencao ja foi maculada com uma sáida ou intenção de saída.
        //Verificar se a entrada é "IN_CENTRAL", em caso positivo, verificar se ja existe um recebimento referente a essa requisicao de material, caso ja exista lance um erro de conflito
        if (
          movementType?.code === MaterialStockOperationSubType.IN_CENTRAL &&
          newReceipt.materialRequest?.maintenanceRequestId
        ) {
          const MaintenanceRequest =
            await this.prisma.maintenanceRequest.findFirst({
              where: {
                id: newReceipt.materialRequest?.maintenanceRequestId
              },
              include: {
                materialPickingOrders: true,
                materialWithdrawals: true
              }
            });

          const isDirtyMaintenanceRequest =
            MaintenanceRequest.materialPickingOrders.length > 0 ||
            MaintenanceRequest.materialWithdrawals.length > 0;

          if (!isDirtyMaintenanceRequest) {
            // lógica para restringir todos os items. criar um método para isso. criar um dto para restringir e chamar o serviço.

            const payloadCreateMaterialRestrictionOrder: CreateMaterialRestrictionOrderWithRelationsDto =
              {
                warehouse: {
                  id: destinationWarehouse.id
                } as any,
                processedByUser: {
                  id: processedByUser.id
                } as any,
                targetMaterialRequest: {
                  id: materialRequest.id
                } as any,
                notes: `Restrição realizada de forma automática durante a entrada do material`,
                processedAt: new Date(),
                items: items.map((item) => {
                  return {
                    globalMaterialId: item.materialId,
                    quantityRestricted: item.quantityReceived,
                    targetMaterialRequestItemId: item.materialRequestItemId
                  } as any;
                })
              };

            //chamando o métdo para restrição dos items
            await this.materialRestrictionOrdersService.create(
              payloadCreateMaterialRestrictionOrder,
              tx as any,
              true
            );
          }
        }

        // ETAPA 4: Retornar o recebimento completo com todas as relações definidas em `includeRelations`.
        // É uma boa prática buscar novamente para garantir que todos os dados aninhados estejam consistentes.
        return tx.materialReceipt.findUniqueOrThrow({
          where: { id: newReceipt.id },
          include: this.includeRelations
        });
      });

      this.logger.log(`Transação concluída com sucesso!`);
      return createdReceipt;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialReceiptsService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: UpdateMaterialReceiptWithRelationsDto
  ): Promise<MaterialReceiptWithRelationsResponseDto> {
    const {
      movementType,
      destinationWarehouse,
      processedByUser,
      materialRequest,
      items,
      ...restOfData
    } = data;

    const updateInput: Prisma.MaterialReceiptUpdateInput = {
      ...restOfData
    };

    if (movementType?.code)
      updateInput.movementType = { connect: { code: movementType.code } };
    if (destinationWarehouse?.id)
      updateInput.destinationWarehouse = {
        connect: { id: destinationWarehouse.id }
      };
    if (processedByUser?.id)
      updateInput.processedByUser = { connect: { id: processedByUser.id } };
    if (materialRequest?.id)
      updateInput.materialRequest = { connect: { id: materialRequest.id } };

    // TODO: Implement logic to update nested items if needed.
    // This would involve checking for existing items, creating new ones, or deleting old ones.

    try {
      return this.prisma.materialReceipt.update({
        where: { id },
        data: updateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialReceiptsService', {
        operation: 'update',
        id,
        data: updateInput
      });
      throw error;
    }
  }

  async delete(id: number): Promise<{ message: string; id: number }> {
    try {
      await this.prisma.materialReceipt.delete({ where: { id } });
      return {
        message: 'Material Receipt deleted successfully',
        id: id
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialReceiptsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  async list(): Promise<MaterialReceiptWithRelationsResponseDto[]> {
    try {
      return this.prisma.materialReceipt.findMany({
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialReceiptsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number): Promise<MaterialReceiptWithRelationsResponseDto> {
    try {
      const materialReceipt = await this.prisma.materialReceipt.findUnique({
        where: { id },
        include: this.includeRelations
      });
      if (!materialReceipt) {
        throw new NotFoundException(`Material Receipt with ID ${id} not found`);
      }
      return materialReceipt;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaterialReceiptsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  /**
   * Verifica a integridade dos recebimentos de materiais, garantindo que cada item de recebimento
   * tenha um movimento de estoque correspondente. Cria movimentos de estoque para
   * itens que não os possuem, utilizando o DTO e o serviço de movimentos existente.
   * Serve também para migração do SISMAN antigo para o novo SISMAN.
   * Migra apenas as entradas e deixa o sistema fazer o ajuste dos movimentos e saldos
   * @returns Um objeto contendo o número de movimentos de estoque criados.
   */
  async verifyIntregrityOfReceipts(): Promise<{
    createdMovementsCount: number;
  }> {
    try {
      this.logger.log(
        'Iniciando verificação de integridade dos recebimentos de materiais.',
        {
          operation: 'verifyIntregrityOfReceipts'
        }
      );

      // 1. Encontrar todos os MaterialReceiptItem que NÃO possuem um MaterialStockMovement associado.
      // Incluímos todos os dados necessários (do cabeçalho do recebimento e dos materiais)
      // para construir o CreateMaterialStockMovementWithRelationsDto.
      const itemsWithoutMovement =
        await this.prisma.materialReceiptItem.findMany({
          where: {
            materialStockMovement: null // Filtra itens que não têm um movimento de estoque linkado
          },
          include: {
            materialReceipt: {
              // Inclui o cabeçalho do recebimento para obter dados como warehouseId, movementTypeId, etc.
              include: {
                destinationWarehouse: { select: { id: true } }, // Para warehouse.id
                movementType: { select: { code: true } }, // Para movementType.code (assumindo que o DTO espera o código)
                processedByUser: { select: { id: true } } // Para processedByUser.id
                // No MaterialReceipt, não há campos para collectedByUser/Worker, pois é um recebimento.
                // Portanto, esses campos serão 'undefined' no DTO de movimento, o que é apropriado.
              }
            },
            // materialId já é um campo escalar em MaterialReceiptItem, então podemos usá-lo diretamente
            // material: { select: { id: true } }, // Não é estritamente necessário se apenas materialId for usado
            materialRequestItem: { select: { id: true } } // Para materialRequestItem?.id
          }
        });

      this.logger.log(
        `Encontrados ${itemsWithoutMovement.length} itens de recebimento sem movimento de estoque.`,
        {
          operation: 'verifyIntregrityOfReceipts'
        }
      );

      if (itemsWithoutMovement.length === 0) {
        return { createdMovementsCount: 0 };
      }

      // 2. Mapear os itens encontrados para a estrutura do DTO de movimentação de estoque.
      const movementsToCreateDTOs: CreateMaterialStockMovementWithRelationsDto[] =
        itemsWithoutMovement
          .map((item) => {
            // Validação adicional para garantir que os dados relacionados existam.
            if (
              !item.materialReceipt ||
              !item.materialReceipt.destinationWarehouse ||
              !item.materialReceipt.movementType ||
              !item.materialReceipt.processedByUser
            ) {
              this.logger.warn(
                `Item de recebimento ${item.id} tem dados relacionados incompletos para criar o movimento. Pulando.`,
                {
                  operation: 'verifyIntregrityOfReceipts',
                  itemId: item.id
                }
              );
              return null;
            }

            return {
              quantity: item.quantityReceived, // Para recebimentos, usamos quantityReceived
              warehouse: { id: item.materialReceipt.destinationWarehouse.id },
              movementType: { code: item.materialReceipt.movementType.code }, // Usa o código do tipo de movimento do recebimento
              processedByUser: { id: item.materialReceipt.processedByUser.id },
              collectedByUser: undefined, // Não aplicável diretamente para recebimentos neste contexto
              collectedByWorker: undefined, // Não aplicável diretamente para recebimentos neste contexto
              globalMaterial: { id: item.materialId }, // Usa o materialId escalar do item
              materialInstance: undefined, // MaterialReceiptItem não tem materialInstance
              materialRequestItem: item.materialRequestItem?.id
                ? { id: item.materialRequestItem.id }
                : undefined,
              materialReceiptItem: { id: item.id }, // ID do item de recebimento para vinculação
              maintenanceRequest: undefined, // Não diretamente vinculado a MaintenanceRequest a partir de um recebimento
              unitPrice: item.unitPrice
              // O DTO ou o serviço de movimentos pode inferir movementDate como a data do recebimento
              // ou usar um default, conforme a implementação do seu `materialStockMovementsService.create`.
              // Se o DTO esperar 'movementDate', adicione: `movementDate: item.materialReceipt.receiptDate,`
            };
          })
          .filter(Boolean) as CreateMaterialStockMovementWithRelationsDto[]; // Filtra quaisquer itens nulos

      if (movementsToCreateDTOs.length === 0) {
        this.logger.log(
          'Nenhum DTO de movimento de estoque válido para criar.',
          {
            operation: 'verifyIntregrityOfReceipts'
          }
        );
        return { createdMovementsCount: 0 };
      }

      this.logger.log(
        `Preparados ${movementsToCreateDTOs.length} DTOs para criação de movimentos de estoque.`,
        {
          operation: 'verifyIntregrityOfReceipts'
        }
      );

      // 3. Criar os movimentos de estoque em uma única transação para garantir atomicidade.
      // Passamos o cliente de transação (tx) para o serviço 'create'.
      const createdMovements = await this.prisma.$transaction(async (tx) => {
        const results = [];
        for (const dto of movementsToCreateDTOs) {
          // Chama o serviço de movimentação, passando o cliente da transação (tx)
          const created = await this.materialStockMovementsService.create(
            dto,
            tx as any
          );
          results.push(created);
        }
        return results;
      });

      this.logger.log(
        `Criados ${createdMovements.length} movimentos de estoque em falta para recebimentos.`,
        {
          operation: 'verifyIntregrityOfReceipts',
          count: createdMovements.length
        }
      );

      return { createdMovementsCount: createdMovements.length };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialReceiptsService', {
        operation: 'verifyIntregrityOfReceipts'
      });
      throw error;
    }
  }
}
