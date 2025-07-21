// prisma/seeds/material-stock-movement-types.seed.ts
import type { Prisma, PrismaClient } from '@sisman/prisma';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn
} from './seed-utils';
import { CreateMaterialStockMovementTypeDto } from '../../../modules/material-stock-movement-types/dto/material-stock-movement-type.dto';

const logger = console;
const movementTypesJsonPath = '../data/material-stock-movement-types.json';

const transformAndValidateMovementType: TransformValidateFn<
  any,
  Prisma.MaterialStockMovementTypeCreateInput
> = async (
  rawMovementType: any
): Promise<Prisma.MaterialStockMovementTypeCreateInput | null> => {
  // --- 1. Pré-processamento dos Dados Brutos ---
  const processedRawMovementType =
    removeNullOrEmptyStringProps(rawMovementType);

  // --- 2. Validação com DTO ---
  const movementTypeDto = plainToInstance(
    CreateMaterialStockMovementTypeDto,
    processedRawMovementType,
    { enableImplicitConversion: true }
  );

  const errors = await validate(movementTypeDto);

  if (errors.length > 0) {
    logger.warn(
      `Pulando tipo de movimentação devido a erros de validação: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Dados Originais: ${JSON.stringify(rawMovementType)}`
    );
    logger.warn('Erros de Validação:', JSON.stringify(errors));
    return null;
  }

  // --- 3. Construção do Input para o Prisma ---
  const createInput: Prisma.MaterialStockMovementTypeUncheckedCreateInput = {
    id: movementTypeDto.id,
    name: movementTypeDto.name,
    code: movementTypeDto.code,
    description: movementTypeDto.description,
    operation: movementTypeDto.operation,
    isActive: movementTypeDto.isActive
  };

  return createInput;
};

export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'MaterialStockMovementType',
    jsonFilePath: movementTypesJsonPath,
    prismaDelegate: prisma.materialStockMovementType,
    transformAndValidate: transformAndValidateMovementType,
    uniqueKey: 'code' // 'code' is a better unique key for movement types
  });
}
