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
import { createSipacImovelDtoWithRelations } from '@sisman/types/backend';

const logger = console;

const sipacImoveisJsonPath = '../data/sipac-imoveis.json';

// --- Define the Transformation and Validation Logic ---
const transformAndValidateSipacImoveis: TransformValidateFn<
  any,
  Prisma.SipacImovelCreateInput
> = async (rawImovel): Promise<Prisma.SipacImovelCreateInput | null> => {
  // --- 1. Pre-process Raw Data using the generic function ---
  let processedRawImovel = removeNullOrEmptyStringProps(rawImovel);

  // --- 1.1. Remove accents and special characters ---
  processedRawImovel = removeAccentsAndSpecialChars(processedRawImovel);

  // --- 2. DTO Validation ---
  // Use o objeto pré-processado para instanciar o DTO
  const imovelDto = plainToInstance(
    createSipacImovelDtoWithRelations,
    processedRawImovel, // Use o objeto já normalizado
    {
      // excludeExtraneousValues: true, // Considere usar para mais segurança
      enableImplicitConversion: true // Helps convert string numbers from JSON if needed
    }
  );
  const errors = await validate(imovelDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping item due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawImovel)}` // Log original data
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }

  // --- 4. Construct Prisma Create Input (using validated DTO data) ---
  const createInput: Prisma.SipacImovelCreateInput = {
    rip: imovelDto.rip,
    nomeImovel: imovelDto.nomeImovel,
    latitude: imovelDto.latitude,
    longitude: imovelDto.longitude,
    tipoVocacao: imovelDto.tipoVocacao,
    tipoFormaAquisicao: imovelDto.tipoFormaAquisicao,
    tipoImovel: imovelDto.tipoImovel,
    //eu garanti que todas tenham endereço, não precisei fazer uma condição
    endereco: {
      create: {
        municipio: imovelDto.endereco.municipio,
        bairro: imovelDto.endereco.bairro,
        logradouro: imovelDto.endereco.logradouro,
        numero: imovelDto.endereco.numero,
        complemento: imovelDto.endereco.complemento,
        cep: imovelDto.endereco.cep
      }
    },
    // Conditionally add the campus relation
    ...(imovelDto.campus
      ? {
          campus: {
            connectOrCreate: {
              where: {
                nomeCampus: imovelDto.campus.nomeCampus // Assumes nomeCampus is valid if campus exists
              },
              create: {
                nomeCampus: imovelDto.campus.nomeCampus
              }
            }
          }
        }
      : {}) // If imovelDto.campus is undefined, an empty object is spread, adding no 'campus' property
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
    modelName: 'SipacImovel',
    jsonFilePath: sipacImoveisJsonPath,
    prismaDelegate: prisma.sipacImovel, // Pass the material delegate
    transformAndValidate: transformAndValidateSipacImoveis,
    uniqueKey: 'rip' // For specific duplicate logging
  });
}
