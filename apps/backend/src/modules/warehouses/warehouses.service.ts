import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { Prisma, PrismaClient } from '@sisman/prisma';

// Definimos os tipos para clareza e reutilização
type WarehouseOperationType = 'WITHDRAWAL' | 'RESERVATION'; // Pode ser estendido com 'RESTRICTION'

interface WarehouseOperationConfig {
  type: WarehouseOperationType;
  idToExclude?: {
    withdrawalId?: number;
    pickingOrderId?: number; // Para reservas futuras
  };
}
@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateWarehouseDto) {
    try {
      const warehouse = await this.prisma.warehouse.create({
        data
      });
      return warehouse;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const warehouses = await this.prisma.warehouse.findMany();
      return warehouses;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: {
          id
        }
      });
      return warehouse;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateWarehouseDto) {
    try {
      const updated = await this.prisma.warehouse.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.warehouse.delete({
        where: {
          id
        }
      });
      return { message: 'Warehouse deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  async validateWarehouseOperation(
    tx: PrismaClient, // É crucial usar o cliente da transação (tx)
    warehouseId: number,
    itemsToVerify: Array<{
      globalMaterialId: string;
      quantity: Prisma.Decimal;
    }>,
    config: WarehouseOperationConfig
  ): Promise<void> {
    if (!itemsToVerify || itemsToVerify.length === 0) {
      return;
    }

    const materialIds = itemsToVerify.map((item) => item.globalMaterialId);

    // 1. Buscar os saldos de todos os materiais relevantes de uma só vez. Somente valida se tiver um saldo inicial definido
    const stockRecords = await tx.materialWarehouseStock.findMany({
      where: {
        warehouseId: warehouseId,
        initialStockQuantity: { not: null },
        materialId: { in: materialIds }
      }
    });

    // 2. Criar um Map para busca O(1) dos saldos.
    const stockMap = new Map(
      stockRecords.map((record) => [record.materialId, record])
    );

    // 3. (Lógica de Exclusão para Updates) - Buscar itens da operação a ser excluída
    const excludedQuantitiesMap = new Map<string, Prisma.Decimal>();
    if (config.idToExclude?.withdrawalId && config.type === 'WITHDRAWAL') {
      const excludedItems = await tx.materialWithdrawalItem.findMany({
        where: { materialWithdrawalId: config.idToExclude.withdrawalId },
        select: { globalMaterialId: true, quantityWithdrawn: true }
      });
      excludedItems.forEach((item) => {
        excludedQuantitiesMap.set(
          item.globalMaterialId,
          item.quantityWithdrawn
        );
      });
    }
    // (Adicionar lógica similar para pickingOrderId se necessário no futuro)

    // 4. Iterar sobre os itens a serem validados.
    for (const item of itemsToVerify) {
      const stock = stockMap.get(item.globalMaterialId);

      if (!stock) {
        // throw new BadRequestException(
        //   `O material ${item.globalMaterialId} não existe.`
        // );
        this.logger.warn(
          `O material ${item.globalMaterialId} não existe no depósito. Pulando validação. Ele vai ser criado na primeira movimentação.`
        );
        //pula os passos abaixo e já vai fazer a validação do próximo item
        continue;
      }

      // 5. Calcular o saldo disponível usando a sintaxe de Prisma.Decimal
      const initial = stock.initialStockQuantity; // Já é Decimal
      const balanceInOut = stock.balanceInMinusOut;
      const reserved = stock.reservedQuantity;
      const restricted = stock.restrictedQuantity;

      // Saldo disponível atual no banco de dados
      let availableBalance = initial
        .plus(balanceInOut)
        .minus(reserved)
        .minus(restricted);

      // Se estivermos atualizando, adicionamos de volta a quantidade da operação
      // que estamos excluindo para obter o saldo "verdadeiro" antes desta operação.
      const excludedQuantity =
        excludedQuantitiesMap.get(item.globalMaterialId) ??
        new Prisma.Decimal(0);
      if (excludedQuantity.isPositive()) {
        availableBalance = availableBalance.plus(excludedQuantity);
      }

      const quantityToVerify = new Prisma.Decimal(item.quantity);

      // 6. A validação principal
      if (quantityToVerify.greaterThan(availableBalance)) {
        const opNoun = config.type === 'WITHDRAWAL' ? 'retirada' : 'reserva';
        throw new ConflictException(
          `Não é possível processar a ${opNoun} de ${quantityToVerify.toString()} para o material ${item.globalMaterialId}. ` +
            `O saldo disponível no almoxarifado é de apenas ${availableBalance.toString()}.`
        );
      }
    }
  }
}
