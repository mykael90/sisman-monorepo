import { Prisma } from '@sisman/prisma';
import { SismanLegacyMaterialOutItem } from '../sisman-legacy-api.interfaces';

export class MaterialWithdrawalItemMapper {
  static toCreateDto(
    item: SismanLegacyMaterialOutItem
  ): Prisma.MaterialWithdrawalItemUncheckedCreateInput {
    return {
      globalMaterialId: String(item.MaterialId),
      materialWithdrawalId: item.MaterialOutId, // Convertido para string
      quantityWithdrawn: new Prisma.Decimal(item.quantity),
      unitPrice: item.value
    };
  }
}
