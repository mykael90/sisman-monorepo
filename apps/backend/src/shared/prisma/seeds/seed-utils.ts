// prisma/seeds/seed-utils.ts
import type { PrismaClient, Prisma } from '@sisman/prisma';
import * as fs from 'fs';
import * as path from 'path'; // Needed if jsonFilePath is relative

const logger = console;

/**
 * Interface for the result of the validation/transformation function.
 * If data is valid, it returns the object ready for Prisma create.
 * If invalid, returns null.
 */
type TransformResult<T> = T | null;

/**
 * Function signature for validating and transforming a single raw data item.
 * @param rawItem - The raw object parsed from the JSON file.
 * @returns A promise resolving to TransformResult<T>, where T is the expected input type for Prisma's `create` method (e.g., Prisma.UserCreateInput).
 */
export type TransformValidateFn<RawType, CreateInputType> = (
  rawItem: RawType
) =>
  | Promise<TransformResult<CreateInputType>>
  | TransformResult<CreateInputType>;

/**
 * Options for the generic seedModel function.
 */
interface SeedModelOptions<RawType, CreateInputType, Delegate> {
  prisma: PrismaClient;
  modelName: string; // e.g., 'User', 'Material' (for logging)
  jsonFilePath: string;
  prismaDelegate: Delegate; // The actual Prisma delegate (e.g., prisma.user, prisma.material)
  transformAndValidate: TransformValidateFn<RawType, CreateInputType>;
  uniqueKey?: keyof CreateInputType; // Optional: field name for duplicate logging (e.g., 'email', 'id')
  method?: 'create' | 'update'; // Default to 'create'
}

/**
 * Generic function to seed a model from a JSON file.
 * @param options - Configuration for the seeding process.
 */
export async function seedModel<
  RawType extends Record<string, any>, // Type of raw data from JSON
  CreateInputType extends Record<string, any>, // Type expected by prismaDelegate.create({ data: ... })
  Delegate extends {
    create?: (args: { data: CreateInputType }) => Promise<any>;
    update?: (args: { where: any; data: CreateInputType }) => Promise<any>;
  } // Type constraint for prismaDelegate
>({
  prisma, // Use the passed prisma instance
  modelName,
  jsonFilePath,
  prismaDelegate,
  transformAndValidate,
  uniqueKey,
  method = 'create'
}: SeedModelOptions<RawType, CreateInputType, Delegate>): Promise<void> {
  logger.log(`--- Seeding ${modelName} ---`);

  let rawDataArray: RawType[];
  try {
    const fullPath = path.resolve(__dirname, jsonFilePath); // Ensure absolute path
    logger.log(`Reading data from: ${fullPath}`);
    const rawData = fs.readFileSync(fullPath, 'utf-8');
    rawDataArray = JSON.parse(rawData);
  } catch (error) {
    logger.error(
      `Error reading or parsing JSON file for ${modelName} at ${jsonFilePath}:`,
      error
    );
    throw new Error(`Failed to load data for ${modelName}`); // Stop seeding if file fails
  }

  if (!Array.isArray(rawDataArray)) {
    logger.error(
      `${modelName} data file (${jsonFilePath}) does not contain a JSON array. Skipping.`
    );
    return;
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const rawItem of rawDataArray) {
    let createData: CreateInputType | null = null;
    try {
      // Validate and transform the raw data using the provided function
      createData = await transformAndValidate(rawItem);

      if (createData === null) {
        // transformAndValidate indicated the item is invalid or should be skipped
        skippedCount++;
        // Optional: Log the raw item that was skipped if needed for debugging
        // logger.warn(`Skipping invalid ${modelName} record (validation failed): ${JSON.stringify(rawItem)}`);
        continue;
      }

      // Attempt to create the record in the database
      if (method === 'create') {
        await prismaDelegate[method]({ data: createData });
      } else if (method === 'update') {
        await prismaDelegate[method]({
          where: { id: createData.id },
          data: createData
        });
      }
      createdCount++;
    } catch (error: any) {
      skippedCount++;
      // Handle potential Prisma errors (like unique constraint violations)
      if (
        error.code === 'P2002' &&
        uniqueKey &&
        createData &&
        createData[uniqueKey]
      ) {
        // Log specific duplicate error if uniqueKey and data are available
        logger.warn(
          `Skipping duplicate ${modelName} record with ${String(uniqueKey)}: ${createData[uniqueKey]}`
        );
      } else if (error.code === 'P2002') {
        logger.warn(
          `Skipping duplicate ${modelName} record (unique key violation). Raw data: ${JSON.stringify(rawItem)}`
        );
      } else if (createData) {
        // Log specific error for the item being processed
        logger.error(
          `Failed to ${method} ${modelName} record for data ${JSON.stringify(createData)}:`,
          error.message || error
        );
      } else {
        // Log error during validation/transformation phase if not caught by transformAndValidate returning null
        logger.error(
          `Error processing ${modelName} record. Raw data: ${JSON.stringify(rawItem)}:`,
          error.message || error
        );
      }
      // Decide whether to continue seeding or stop on error
      // throw error; // Uncomment this line to stop the entire seed process on the first error
    }
  }

  logger.log(`Seeded ${createdCount} ${modelName} records.`);
  if (skippedCount > 0) {
    logger.warn(
      `Skipped ${skippedCount} ${modelName} records due to validation errors or duplicates.`
    );
  }
  logger.log(`--- Finished Seeding ${modelName} ---`);
}

/**
 * Remove propriedades com valor null ou string vazia ('') de um objeto.
 * Cria uma cópia superficial (shallow copy) para não modificar o objeto original.
 * @param rawObject O objeto a ser limpo.
 * @returns Um novo objeto com as propriedades nulas ou vazias removidas.
 */
export function removeNullOrEmptyStringProps<T extends Record<string, any>>(
  rawObject: T
): Partial<T> {
  // Cria uma cópia superficial para evitar mutar o objeto original
  const cleanedObject: Partial<T> = { ...rawObject };

  for (const key in cleanedObject) {
    // Verifica se a propriedade pertence ao próprio objeto (e não ao prototype)
    if (Object.prototype.hasOwnProperty.call(cleanedObject, key)) {
      const value = cleanedObject[key];
      // Remove se for estritamente null ou uma string vazia
      if (value === null || value === '') {
        logger.debug(
          `Preprocessing: Removing property "${key}" because it was null or empty.`
        );
        delete cleanedObject[key];
      }
    }
  }
  return cleanedObject;
}
