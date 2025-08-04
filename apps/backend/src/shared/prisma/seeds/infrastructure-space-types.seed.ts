// prisma/seeds/infrastructure-space-types.seed.ts
import type { Prisma, PrismaClient } from '@sisman/prisma';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn
} from './seed-utils';
import { CreateInfrastructureSpaceTypeDto } from '@sisman/types/backend';

const logger = console;
const spaceTypesJsonPath = '../data/infrastructure-space-types.json';

const transformAndValidateSpaceType: TransformValidateFn<
  any,
  Prisma.InfrastructureSpaceTypeCreateInput
> = async (
  rawSpaceType: any
): Promise<Prisma.InfrastructureSpaceTypeCreateInput | null> => {
  // --- 1. Pré-processamento dos Dados Brutos ---
  const processedRawSpaceType = removeNullOrEmptyStringProps(rawSpaceType);

  // --- 2. Validação com DTO ---
  // CreateInfrastructureSpaceTypeDto valida os campos necessários.
  // O 'id' será validado manualmente, pois é necessário para o seeding.
  const spaceTypeDto = plainToInstance(
    CreateInfrastructureSpaceTypeDto,
    processedRawSpaceType,
    { enableImplicitConversion: true } // Importante para `isActive` (boolean)
  );

  const errors = await validate(spaceTypeDto);

  // // Validação manual para 'id'
  // if (
  //   processedRawSpaceType.id === undefined ||
  //   processedRawSpaceType.id === null ||
  //   typeof processedRawSpaceType.id !== 'number'
  // ) {
  //   logger.warn(
  //     `Pulando tipo de espaço devido a ID ausente ou inválido. Dados Originais: ${JSON.stringify(rawSpaceType)}`
  //   );
  //   return null;
  // }

  if (errors.length > 0) {
    logger.warn(
      `Pulando tipo de espaço devido a erros de validação: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Dados Originais: ${JSON.stringify(rawSpaceType)}`
    );
    logger.warn('Erros de Validação:', JSON.stringify(errors));
    return null;
  }

  // --- 3. Construção do Input para o Prisma ---
  const createInput: Prisma.InfrastructureSpaceTypeCreateInput = {
    name: spaceTypeDto.name,
    description: spaceTypeDto.description,
    icon: spaceTypeDto.icon,
    isActive: spaceTypeDto.isActive
  };

  return createInput;
};

export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'InfrastructureSpaceType',
    jsonFilePath: spaceTypesJsonPath,
    prismaDelegate: prisma.infrastructureSpaceType,
    transformAndValidate: transformAndValidateSpaceType,
    uniqueKey: 'name'
  });
}
