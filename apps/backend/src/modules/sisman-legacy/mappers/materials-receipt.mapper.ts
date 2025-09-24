import {
  Prisma,
  MaterialStockOperationSubType,
  MaterialReceiptStatus,
  MaterialStockOperationType, // Adicionar este import
  MaterialReceiptItem
} from '@sisman/prisma';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../../shared/prisma/prisma.module';
import { CreateMaterialReceiptWithRelationsDto } from '../../material-receipts/dto/material-receipt.dto';
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
  ): Promise<CreateMaterialReceiptWithRelationsDto> {
    const movementTypeCode =
      MaterialIntypeIdToMovementTypeCode[item.materialIntypeId];

    const now = new Date();

    let materialRequestId: number | undefined;
    if (item.req) {
      // Exemplo: buscar materialRequest pelo número de protocolo
      const materialRequest = await this.prisma.materialRequest.findFirst({
        select: { id: true },
        where: {
          protocolNumber: item.req // Assumindo que req é o protocolo
        }
      });
      materialRequestId = materialRequest?.id;
    }

    return {
      id: item.id,
      externalReference: item.invoice,
      receiptDate: new Date(item.createdAt),
      movementType: {
        code: movementTypeCode
      } as any,
      sourceName: item.receivedBy, // Assumindo que 'receivedBy' é o nome da origem
      destinationWarehouse: {
        id: 1
      } as any,
      processedByUser: {
        id: item.userId
      } as any,
      status: MaterialReceiptStatus.FULLY_ACCEPTED, // Alterado para FULLY_ACCEPTED
      notes: `IMPORTADO DO SISMAN LEGACY EM ${getNowFormatted()} \n ${item.obs || ''}`,
      valueReceipt: new Prisma.Decimal(item.value),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      items: item.MaterialInItems.map((materialItem) => ({
        materialId: String(materialItem.materialId), // Convertido para string
        quantityExpected: new Prisma.Decimal(materialItem.quantity),
        quantityReceived: new Prisma.Decimal(materialItem.quantity),
        quantityRejected: new Prisma.Decimal(0),
        unitPrice: new Prisma.Decimal(materialItem.value)
      })) as any, // Adicionar cast para o tipo correto
      materialRequest: { id: materialRequestId } as any, // Não há materialRequest no legado para mapear diretamente
      materialWithdrawal: { id: item.returnId } as any // Não há materialWithdrawal no legado para mapear diretamente
    };
  }
}
