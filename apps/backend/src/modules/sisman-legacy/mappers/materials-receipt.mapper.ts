import {
  Prisma,
  MaterialStockOperationSubType,
  MaterialReceiptStatus
} from '@sisman/prisma';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../../shared/prisma/prisma.module';
import { SismanLegacyMaterialInResponseItem } from '../sisman-legacy-api.interfaces';
import { getNowFormatted } from '../../../shared/utils/date-utils';

const MaterialIntypeIdToMovementTypeCode: Record<
  number,
  MaterialStockOperationSubType
> = {
  1: MaterialStockOperationSubType.IN_CENTRAL, // RM AUTO
  2: MaterialStockOperationSubType.IN_CENTRAL, // RM MANUAL
  3: MaterialStockOperationSubType.IN_SERVICE_SURPLUS, // RETORNO
  4: MaterialStockOperationSubType.IN_PURCHASE, // FORNECEDOR
  5: MaterialStockOperationSubType.IN_DONATION, // DOACAO
  6: MaterialStockOperationSubType.IN_TRANSFER, // INFRA
  7: MaterialStockOperationSubType.ADJUSTMENT_RECLASSIFY_IN // TRANSFORME
};

@Injectable()
export class MaterialReceiptMapper {
  private readonly logger = new Logger(MaterialReceiptMapper.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async toCreateDto(
    item: SismanLegacyMaterialInResponseItem
  ): Promise<Prisma.MaterialReceiptUncheckedCreateInput> {
    const movementTypeCode =
      MaterialIntypeIdToMovementTypeCode[item.materialIntypeId];

    const now = new Date();

    let materialRequestId: number | undefined;
    if (item.req) {
      // Exemplo: buscar materialRequest pelo número de protocolo
      const materialRequest = await this.prisma.materialRequest.findFirst({
        select: { id: true },
        include: { items: true },
        where: {
          protocolNumber: item.req // Assumindo que req é o protocolo
        }
      });
      materialRequestId = materialRequest?.id;
    }

    const movementType = await this.prisma.materialStockMovementType.findFirst({
      select: { id: true },
      where: {
        code: movementTypeCode
      }
    });

    return {
      id: item.id,
      externalReference: item.invoice,
      receiptDate: new Date(item.createdAt),
      movementTypeId: movementType?.id,
      sourceName: item.receivedBy, // Assumindo que 'receivedBy' é o nome da origem
      destinationWarehouseId: 1,
      processedByUserId: item.userId,
      status: MaterialReceiptStatus.FULLY_ACCEPTED, // Alterado para FULLY_ACCEPTED
      notes: `IMPORTADO DO SISMAN LEGACY EM ${getNowFormatted()} \n ${item.obs || ''}`,
      valueReceipt: new Prisma.Decimal(item.value),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      items: {
        createMany: {
          data: item.MaterialInItems.map((materialItem) => ({
            materialId: String(materialItem.materialId), // Convertido para string
            quantityExpected: new Prisma.Decimal(materialItem.quantity),
            quantityReceived: new Prisma.Decimal(materialItem.quantity),
            quantityRejected: new Prisma.Decimal(0),
            unitPrice: new Prisma.Decimal(materialItem.value)
          }))
        }
      }, // Adicionar cast para o tipo correto
      materialRequestId: materialRequestId,
      materialWithdrawalId: item.returnId
    };
  }
}
