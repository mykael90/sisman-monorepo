import { Prisma } from '@sisman/prisma';
import {
  SismanLegacyMaterialOutFile,
  SismanLegacyMaterialOutItem
} from '../sisman-legacy-api.interfaces';

export class MaterialWithdrawalFileMapper {
  static toCreateDto(
    item: SismanLegacyMaterialOutFile
  ): Prisma.AttachmentCreateInput {
    const extension = item.src.split('.').pop();
    return {
      fileExtension: extension || '',
      originalFileName: item.originalName,
      fileType: `image/${extension}`,
      storedFileName: item.filename,
      relatedModel: 'MaterialWithdrawal',
      relatedId: String(item.MaterialOutId),
      sizeInBytes: 1,
      localPath: `/home/node/sisman-monorepo/apps/backend/storage/materialwithdrawal/${item.filename}`
    };
  }
}
