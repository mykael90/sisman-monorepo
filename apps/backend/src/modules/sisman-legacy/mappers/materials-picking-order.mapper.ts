import { Prisma, MaterialPickingOrderStatus } from '@sisman/prisma';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../../shared/prisma/prisma.module';
import { SismanLegacyMaterialReserve } from '../sisman-legacy-api.interfaces';
import { getNowFormatted } from '../../../shared/utils/date-utils';

@Injectable()
export class MaterialPickingOrderMapper {
  private readonly logger = new Logger(MaterialPickingOrderMapper.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  private getStatus(
    item: SismanLegacyMaterialReserve
  ): MaterialPickingOrderStatus {
    if (item.canceledAt) {
      return MaterialPickingOrderStatus.CANCELLED;
    }
    if (item.withdrawnAt) {
      return MaterialPickingOrderStatus.FULLY_WITHDRAWN;
    }
    if (item.separatedAt) {
      return MaterialPickingOrderStatus.IN_PREPARATION;
    }
    return MaterialPickingOrderStatus.IN_PREPARATION;
  }

  async toCreateDto(
    item: SismanLegacyMaterialReserve
  ): Promise<Prisma.MaterialPickingOrderUncheckedCreateInput> {
    const status = this.getStatus(item);

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
      if (materialRequest?.items.length > 0) {
        for (const item of materialRequest.items) {
          mapRequest.set(item.requestedGlobalMaterialId, item.id);
        }
      }
    }

    return {
      id: item.id,
      warehouseId: 1,
      notes: `IMPORTADO DO SISMAN LEGACY EM ${getNowFormatted()} 
 ${item.obs || ''}`,
      status,
      maintenanceRequestId,
      materialRequestId,
      desiredPickupDate: new Date(item.intendedUse),
      requestedByUserId: item.userId,
      beCollectedByWorkerId: item.workerId,
      legacy_place: item.place,
      valuePickingOrder: new Prisma.Decimal(item.value),
      items: {
        createMany: {
          data: item.MaterialReserveItems?.map((materialItem) => ({
            globalMaterialId: String(materialItem.MaterialId),
            quantityToPick: new Prisma.Decimal(materialItem.quantity),
            unitPrice: new Prisma.Decimal(materialItem.value),
            materialRequestItemId: mapRequest.get(
              String(materialItem.MaterialId)
            )
          }))
        }
      }
    };
  }
}
