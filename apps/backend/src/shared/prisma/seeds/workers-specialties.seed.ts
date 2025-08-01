// prisma/seeds/worker-specialties.seed.ts
import type { Prisma, PrismaClient } from '@sisman/prisma';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn
} from './seed-utils';
import { WorkerSpecialtyCreateDto } from '@sisman/types';

const logger = console;
const specialtiesJsonPath = '../data/workers-specialties.json';

const transformAndValidateSpecialty: TransformValidateFn<
  any,
  Prisma.WorkerSpecialtyCreateInput
> = async (
  rawSpecialty: any
): Promise<Prisma.WorkerSpecialtyCreateInput | null> => {
  // --- 1. Pré-processamento dos Dados Brutos ---
  const processedRawSpecialty = removeNullOrEmptyStringProps(rawSpecialty);

  // --- 2. Validação com DTO ---
  // WorkerSpecialtyCreateDto valida 'name' e 'description'.
  // O 'id' será validado manualmente, pois é necessário para o seeding, mas omitido no DTO.
  const specialtyDto = plainToInstance(
    WorkerSpecialtyCreateDto,
    processedRawSpecialty
  );

  const errors = await validate(specialtyDto);

  // Validação manual para 'id'
  if (
    processedRawSpecialty.id === undefined ||
    processedRawSpecialty.id === null ||
    typeof processedRawSpecialty.id !== 'number'
  ) {
    logger.warn(
      `Pulando especialidade devido a ID ausente ou inválido. Dados Originais: ${JSON.stringify(rawSpecialty)}`
    );
    return null;
  }

  if (errors.length > 0) {
    logger.warn(
      `Pulando especialidade devido a erros de validação: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Dados Originais: ${JSON.stringify(rawSpecialty)}`
    );
    logger.warn('Erros de Validação:', JSON.stringify(errors));
    return null;
  }

  // --- 3. Construção do Input para o Prisma ---
  const createInput: Prisma.WorkerSpecialtyUncheckedCreateInput = {
    id: processedRawSpecialty.id, // ID dos dados brutos
    name: specialtyDto.name,
    description: specialtyDto.description
  };

  return createInput;
};

export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'WorkerSpecialty',
    jsonFilePath: specialtiesJsonPath,
    prismaDelegate: prisma.workerSpecialty,
    transformAndValidate: transformAndValidateSpecialty,
    uniqueKey: 'name'
  });
}
