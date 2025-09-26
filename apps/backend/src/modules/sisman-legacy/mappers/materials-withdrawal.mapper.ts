import { Prisma, MaterialStockOperationSubType } from '@sisman/prisma';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../../shared/prisma/prisma.module';
import { SismanLegacyMaterialOutResponseItem } from '../sisman-legacy-api.interfaces';
import { getNowFormatted } from '../../../shared/utils/date-utils';

const MaterialOuttypeIdToMovementTypeCode: Record<
  number,
  MaterialStockOperationSubType
> = {
  1: MaterialStockOperationSubType.OUT_SERVICE_USAGE, // USO
  2: MaterialStockOperationSubType.OUT_PROCESSING, // BENEFICIAMENTO
  3: MaterialStockOperationSubType.OUT_TRANSFER, // DEVOLUCAO
  4: MaterialStockOperationSubType.OUT_LOAN, // EMPRESTIMO
  5: MaterialStockOperationSubType.OUT_DISPOSAL_DAMAGE, // DESCARTE
  6: MaterialStockOperationSubType.OUT_TRANSFER, // INFRA
  7: MaterialStockOperationSubType.OUT_DONATION, // DOACAO
  8: MaterialStockOperationSubType.OUT_LOSS, // EXTRAVIO
  9: MaterialStockOperationSubType.OUT_DISPOSAL_OBSOLETE // TRANSFORME
};

@Injectable()
export class MaterialWithdrawalMapper {
  private readonly logger = new Logger(MaterialWithdrawalMapper.name);

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
    item: SismanLegacyMaterialOutResponseItem
  ): Promise<Prisma.MaterialWithdrawalUncheckedCreateInput> {
    let movementTypeCode =
      MaterialOuttypeIdToMovementTypeCode[item.materialOuttypeId];

    const now = new Date();

    let maintenanceRequestId: number | undefined;
    if (item.reqMaintenance) {
      // Exemplo: buscar maintenanceRequest pelo número de protocolo
      const maintenanceRequest = await this.prisma.maintenanceRequest.findFirst(
        {
          select: { id: true },
          where: {
            protocolNumber: item.reqMaintenance // Assumindo que reqMaintenance é o protocolo
          }
        }
      );
      maintenanceRequestId = maintenanceRequest?.id;

      //se não tiver requisicao de manutencao, foi uma saide de emergencia, ajustar o tipo de movimento
      movementTypeCode = maintenanceRequestId
        ? movementTypeCode
        : MaterialStockOperationSubType.OUT_EMERGENCY_USAGE;
    }

    // Mapear materialRequestId, materialRequest.items.id
    let materialRequestId: number | undefined;
    const mapRequest = new Map<string, number>();
    if (item.reqMaterial) {
      // Exemplo: buscar materialRequest pelo número de protocolo
      const materialRequest = await this.prisma.materialRequest.findFirst({
        select: { id: true, items: true },
        where: {
          protocolNumber: item.reqMaterial // Assumindo que req é o protocolo
        }
      });
      materialRequestId = materialRequest?.id;

      //mapeando o id de cada item do materialRequest
      for (const item of materialRequest.items) {
        mapRequest.set(item.requestedGlobalMaterialId, item.id);
      }
    }

    const movementType = await this.prisma.materialStockMovementType.findFirst({
      select: { id: true },
      where: {
        code: movementTypeCode
      }
    });

    // os ids worker e users ja devem esta corretos no banco de dados destino
    // é quem autoriza se não for tirado pelo trabalhador
    const collectedByUserId = !item.workerId ? item.authorizedBy : undefined;
    const collectedByWorkerId = item.workerId;

    return {
      id: item.id,
      warehouseId: 1,
      processedByUserId: item.userId,
      collectedByUserId: collectedByUserId,
      authorizedByUserId: item.authorizedBy,
      collectedByWorkerId: collectedByWorkerId,
      withdrawalDate: new Date(item.created_at),
      maintenanceRequestId: maintenanceRequestId,
      materialRequestId: materialRequestId,
      // materialPickingOrderId: item.materialReserveId, // materialReserveId pode ser mapeado aqui
      movementTypeId: movementType?.id,
      notes: `IMPORTADO DO SISMAN LEGACY EM ${getNowFormatted()} \n ${item.obs || ''}`,
      valueWithdrawal: new Prisma.Decimal(item.value),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      legacy_place: item.place,
      items: {
        createMany: {
          data: item.MaterialOutItems.map((materialItem) => ({
            globalMaterialId: String(materialItem.MaterialId), // Convertido para string
            quantityWithdrawn: new Prisma.Decimal(materialItem.quantity),
            unitPrice: materialItem.value,
            materialRequestItemId: mapRequest.get(
              String(materialItem.MaterialId)
            )
          }))
        }
      }
    };
  }
}
