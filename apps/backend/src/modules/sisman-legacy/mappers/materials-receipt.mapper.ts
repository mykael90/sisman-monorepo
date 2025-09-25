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

  // Helper to parse string to Prisma.Decimal or undefined
  parseDecimal(
    // Tornando público para ser acessível por SipacListaRequisicaoMaterialMapper
    value: string | undefined | null
  ): Prisma.Decimal | undefined {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === '' ||
      String(value).toLowerCase() === 'null'
    ) {
      return undefined;
    }
    const cleanedValue = String(value)
      .replace('R$', '')
      .replace(/\.(?=.*\.)/g, '') // Remove thousands separators if present (e.g., 1.234,56)
      .replace(',', '.') // Replace decimal comma with dot
      .trim();
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? undefined : (num as unknown as Prisma.Decimal);
  }

  async toCreateDto(
    item: SismanLegacyMaterialInResponseItem
  ): Promise<Prisma.MaterialReceiptUncheckedCreateInput> {
    const movementTypeCode =
      MaterialIntypeIdToMovementTypeCode[item.materialIntypeId];

    // Mapear materialRequestId, materialRequest.items.id
    let materialRequestId: number | undefined;
    const mapRequest = new Map<string, number>();
    if (item.req) {
      // Exemplo: buscar materialRequest pelo número de protocolo
      const materialRequest = await this.prisma.materialRequest.findFirst({
        select: { id: true, items: true },
        where: {
          protocolNumber: item.req // Assumindo que req é o protocolo
        }
      });
      materialRequestId = materialRequest?.id;

      //mapeando o id de cada item do materialRequest
      for (const item of materialRequest.items) {
        mapRequest.set(item.requestedGlobalMaterialId, item.id);
      }
    }

    // Mapear materialReWithdrawal, materialWithdrawal.items.id
    let materialWithdrawalId: number | undefined;
    const mapWithdrawal = new Map<string, number>();
    if (item.returnId) {
      // Exemplo: buscar materialWithdrawal pelo número de protocolo
      const materialWithdrawal = await this.prisma.materialWithdrawal.findFirst(
        {
          select: { id: true, items: true },
          where: {
            id: item.returnId // Assumindo que req é o protocolo
          }
        }
      );
      materialWithdrawalId = materialWithdrawal?.id;

      //mapeando o id de cada item do materialWithdrawal
      for (const item of materialWithdrawal.items) {
        mapWithdrawal.set(item.globalMaterialId, item.id);
      }
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
      receiptDate: new Date(item.created_at),
      movementTypeId: movementType.id,
      sourceName: item.receivedBy, // Assumindo que 'receivedBy' é o nome da origem
      destinationWarehouseId: 1,
      processedByUserId: item.userId,
      status: MaterialReceiptStatus.FULLY_ACCEPTED, // Alterado para FULLY_ACCEPTED
      notes: `IMPORTADO DO SISMAN LEGACY EM ${getNowFormatted()} \n ${item.obs || ''}`,
      valueReceipt: new Prisma.Decimal(item.value),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      items: {
        createMany: {
          data: item.MaterialInItems.map((materialItem) => ({
            materialId: String(materialItem.MaterialId), // Convertido para string
            quantityExpected: new Prisma.Decimal(materialItem.quantity),
            quantityReceived: new Prisma.Decimal(materialItem.quantity),
            quantityRejected: new Prisma.Decimal(0),
            unitPrice: new Prisma.Decimal(materialItem.value),
            materialRequestItemId: mapRequest.get(
              String(materialItem.MaterialId)
            ),
            materialWithdrawalItemId: mapWithdrawal.get(
              String(materialItem.MaterialId)
            )
          }))
        }
      }, // Adicionar cast para o tipo correto
      materialRequestId: materialRequestId,
      materialWithdrawalId: item.returnId
    };
  }
}
