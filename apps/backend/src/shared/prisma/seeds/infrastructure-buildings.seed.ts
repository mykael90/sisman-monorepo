import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
// Importe a função de limpeza e as outras utilidades
import {
  seedModel,
  TransformValidateFn,
  removeNullOrEmptyStringProps,
  removeAccentsAndSpecialChars // <-- Importe a nova função aqui
} from './seed-utils';
import { CreateInfrastructureBuildingDto } from '@sisman/types/backend';

const logger = console;

const infrastructureBuildingsJsonPath = '../data/infrastructure-buildings.json';

// --- Define the Transformation and Validation Logic ---
const transformAndValidateInfrastructureBuildings: TransformValidateFn<
  any,
  Prisma.InfrastructureBuildingUncheckedCreateInput
> = async (
  rawBuilding
): Promise<Prisma.InfrastructureBuildingUncheckedCreateInput | null> => {
  // --- 1. Pre-process Raw Data using the generic function ---
  let processedRawBuilding = removeNullOrEmptyStringProps(rawBuilding);

  // --- 1.1. Remove accents and special characters ---
  // processedRawBuilding = removeAccentsAndSpecialChars(processedRawBuilding);

  // --- 2. DTO Validation ---
  // Use o objeto pré-processado para instanciar o DTO
  const buildingDto = plainToInstance(
    CreateInfrastructureBuildingDto,
    processedRawBuilding, // Use o objeto já normalizado
    {
      // excludeExtraneousValues: true, // Considere usar para mais segurança
      enableImplicitConversion: true // Helps convert string numbers from JSON if needed
    }
  );
  const errors = await validate(buildingDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping item due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawBuilding)}` // Log original data
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }

  // --- 4. Construct Prisma Create Input (using validated DTO data) ---
  const createInput: Prisma.InfrastructureBuildingUncheckedCreateInput = {
    id: buildingDto.id,
    name: buildingDto.name,
    zone: buildingDto.zone,
    latitude: buildingDto.latitude,
    longitude: buildingDto.longitude,
    facilityComplexId: buildingDto.facilityComplexId
    // Adicione outras propriedades conforme necessário
  };

  return createInput;
};
/**
 * Seeds material data using the generic utility.
 * @param prisma - The Prisma client instance.
 */
export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'InfrastructureBuilding',
    jsonFilePath: infrastructureBuildingsJsonPath,
    prismaDelegate: prisma.infrastructureBuilding, // Pass the material delegate
    transformAndValidate: transformAndValidateInfrastructureBuildings,
    uniqueKey: 'id' // For specific duplicate logging
  });
}
