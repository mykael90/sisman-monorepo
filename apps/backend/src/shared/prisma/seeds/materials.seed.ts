import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
// Importe a função de limpeza e as outras utilidades
import {
  seedModel,
  TransformValidateFn,
  removeNullOrEmptyStringProps // <-- Importe aqui
} from './seed-utils';
import { CreateMaterialDto } from '@sisman/types';

const logger = console;

const materialsJsonPath = '../data/materials.json';

// --- Define the Transformation and Validation Logic ---
const transformAndValidateMaterial: TransformValidateFn<
  any,
  Prisma.MaterialGlobalCatalogCreateInput
> = async (
  rawMaterial
): Promise<Prisma.MaterialGlobalCatalogCreateInput | null> => {
  // --- 1. Pre-process Raw Data using the generic function ---
  const processedRawMaterial = removeNullOrEmptyStringProps(rawMaterial);
  // logger.debug(`Raw material after cleaning null/empty: ${JSON.stringify(processedRawMaterial)}`);

  // --- 2. DTO Validation ---
  // Use o objeto pré-processado para instanciar o DTO
  const materialDto = plainToInstance(CreateMaterialDto, processedRawMaterial, {
    // excludeExtraneousValues: true, // Considere usar para mais segurança
  });
  const errors = await validate(materialDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping material due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawMaterial)}` // Log original data
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }
  // --- End DTO Validation ---

  // --- 3. Data Transformation (using validated DTO data) ---
  // let materialIdBigInt: bigint;
  // try {
  //   // O ID já foi validado pelo DTO (se for string/number), agora converta
  //   materialIdBigInt = BigInt(materialDto.id); // Convert ID from DTO to BigInt
  // } catch (e) {
  //   logger.warn(
  //     `Skipping material: Invalid ID format (must be convertible to BigInt) in DTO after validation. Original Data: ${JSON.stringify(rawMaterial)}`
  //   );
  //   return null;
  // }

  // --- 4. Construct Prisma Create Input (using validated DTO data) ---
  const createInput: Prisma.MaterialGlobalCatalogCreateInput = {
    id: materialDto.id,
    // code: materialDto.code,
    name: materialDto.name,
    unitOfMeasure: materialDto.unitOfMeasure,
    // Use os campos do DTO validado. Se forem opcionais no DTO e não existirem, não serão incluídos.
    ...(materialDto.description && {
      description: materialDto.description
    }),
    // O DTO já deve ter transformado para boolean se necessário (@Transform)
    // ou validado (@IsBoolean). Inclua se existir no DTO.
    ...(materialDto.isActive !== undefined && {
      isActive: materialDto.isActive
    })
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
    modelName: 'Material',
    jsonFilePath: materialsJsonPath,
    prismaDelegate: prisma.materialGlobalCatalog, // Pass the material delegate
    transformAndValidate: transformAndValidateMaterial,
    uniqueKey: 'id' // For specific duplicate logging
  });
}
