import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialReceiptWithRelationsDto,
  UpdateMaterialReceiptWithRelationsDto,
  MaterialReceiptWithRelationsResponseDto
} from './dto/material-receipt.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { Prisma, MaterialReceiptStatus } from '@sisman/prisma';

@Injectable()
export class MaterialReceiptsService {
  private readonly logger = new Logger(MaterialReceiptsService.name);
  constructor(private readonly prisma: PrismaService) {}

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
    try {
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
        movementType: movementType?.id
          ? { connect: { id: movementType.id } }
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
          createMany: {
            data: items
          }
        }
      };

      const newReceipt = await this.prisma.materialReceipt.create({
        data: receiptCreateInput,
        include: this.includeRelations
      });

      return newReceipt;
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

    if (movementType?.id)
      updateInput.movementType = { connect: { id: movementType.id } };
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
