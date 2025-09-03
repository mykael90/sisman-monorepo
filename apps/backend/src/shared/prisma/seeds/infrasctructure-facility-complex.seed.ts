import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  seedModel,
  TransformValidateFn,
  removeNullOrEmptyStringProps,
  removeAccentsAndSpecialChars
} from './seed-utils';
import { SeedInfrastructureFacilityComplexDto } from '../../../modules/infrastructure-facilities-complexes/dto/infrastructure-facility-complex.dto';

const logger = console;

const infrastructureFacilityComplexJsonPath =
  '../data/infrastructure-facility-complex.json';

// --- Define the Transformation and Validation Logic ---
const transformAndValidateInfrastructureFacilityComplex: TransformValidateFn<
  any,
  Prisma.InfrastructureFacilityComplexUncheckedCreateInput
> = async (
  rawFacilityComplex
): Promise<Prisma.InfrastructureFacilityComplexUncheckedCreateInput | null> => {
  // --- 1. Pre-process Raw Data using the generic function ---
  let processedRawFacilityComplex =
    removeNullOrEmptyStringProps(rawFacilityComplex);

  // --- 1.1. Remove accents and special characters ---
  // processedRawFacilityComplex = removeAccentsAndSpecialChars(processedRawFacilityComplex);

  // --- 2. DTO Validation ---
  const facilityComplexDto = plainToInstance(
    SeedInfrastructureFacilityComplexDto,
    processedRawFacilityComplex,
    {
      enableImplicitConversion: true
    }
  );
  const errors = await validate(facilityComplexDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping item due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawFacilityComplex)}`
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }

  // --- 4. Construct Prisma Create Input (using validated DTO data) ---
  const createInput: Prisma.InfrastructureFacilityComplexUncheckedCreateInput =
    {
      id: facilityComplexDto.id,
      name: facilityComplexDto.name,
      address: facilityComplexDto.address,
      complement: facilityComplexDto.complement,
      city: facilityComplexDto.city,
      cep: facilityComplexDto.cep,
      latitude: facilityComplexDto.latitude,
      longitude: facilityComplexDto.longitude,
      type: facilityComplexDto.type,
      maintenanceInstanceId: facilityComplexDto.maintenanceInstanceId
    };

  return createInput;
};

/**
 * Seeds infrastructure facility complex data using the generic utility.
 * @param prisma - The Prisma client instance.
 */
export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'InfrastructureFacilityComplex',
    jsonFilePath: infrastructureFacilityComplexJsonPath,
    prismaDelegate: prisma.infrastructureFacilityComplex,
    transformAndValidate: transformAndValidateInfrastructureFacilityComplex,
    uniqueKey: 'id'
  });
}
