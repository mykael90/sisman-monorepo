import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject
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
import { Prisma, MaterialReceiptStatus } from '@sisman/prisma';
import { MaterialStockMovementsService } from '../material-stock-movements/material-stock-movements.service';
import {
  CreateMaterialStockMovementDto,
  CreateMaterialStockMovementWithRelationsDto
} from '../material-stock-movements/dto/material-stock-movements.dto';

@Injectable()
export class MaterialReceiptsService {
  private readonly logger = new Logger(MaterialReceiptsService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly materialStockMovementsService: MaterialStockMovementsService
  ) {}

  private readonly includeRelations: Prisma.MaterialReceiptInclude = {
    movementType: true,
    destinationWarehouse: true,
    processedByUser: true,
    items: true,
    materialRequest: true
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
        // ETAPA 1: Criar o Recibo de Material e seus Itens.
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

        // ETAPA 3: Retornar o recibo completo com todas as relações definidas em `includeRelations`.
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
}
