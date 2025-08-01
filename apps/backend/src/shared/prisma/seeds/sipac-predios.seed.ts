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
import { CreateSipacPredioDto } from '@sisman/types';

const logger = console;

const sipacPrediosJsonPath = '../data/sipac-predios.json';

// --- Define the Transformation and Validation Logic ---
const transformAndValidateSipacPredios: TransformValidateFn<
  any,
  Prisma.SipacPredioUncheckedCreateInput
> = async (
  rawPredio
): Promise<Prisma.SipacPredioUncheckedCreateInput | null> => {
  // --- 1. Pre-process Raw Data using the generic function ---
  let processedRawPredio = removeNullOrEmptyStringProps(rawPredio);

  // --- 1.1. Remove accents and special characters ---
  processedRawPredio = removeAccentsAndSpecialChars(processedRawPredio);

  // --- 2. DTO Validation ---
  // Use o objeto pré-processado para instanciar o DTO
  const predioDto = plainToInstance(
    CreateSipacPredioDto,
    processedRawPredio, // Use o objeto já normalizado
    {
      // excludeExtraneousValues: true, // Considere usar para mais segurança
      enableImplicitConversion: true // Helps convert string numbers from JSON if needed
    }
  );
  const errors = await validate(predioDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping item due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawPredio)}` // Log original data
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }

  // --- 4. Construct Prisma Create Input (using validated DTO data) ---
  const createInput: Prisma.SipacPredioUncheckedCreateInput = {
    subRip: predioDto.subRip,
    denominacaoPredio: predioDto.denominacaoPredio,
    idZona: predioDto.idZona,
    latitude: predioDto.latitude,
    longitude: predioDto.longitude,
    ripImovel: predioDto.ripImovel
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
    modelName: 'SipacPredio',
    jsonFilePath: sipacPrediosJsonPath,
    prismaDelegate: prisma.sipacPredio, // Pass the material delegate
    transformAndValidate: transformAndValidateSipacPredios,
    uniqueKey: 'subRip' // For specific duplicate logging
  });
}
