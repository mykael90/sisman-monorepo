// prisma/seeds/users-roletypes.seed.ts
import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn,
} from './seed-utils';
import { CreateUserRoletypeDto } from '../../dto/user/role/create-user-roletype.dto';
// Adjust the path if your DTO is located elsewhere

const logger = console;
const userRoletypeJsonPath = '../data/users-roletypes.json';

const transformAndValidateUserRoletypes: TransformValidateFn<
  any,
  Prisma.UserRoletypeCreateInput // Assuming your model name is UserRoletypes
> = async (rawRoleType): Promise<Prisma.UserRoletypeCreateInput | null> => {
  // --- 1. Pre-process Raw Data ---
  const processedRawRoleType = removeNullOrEmptyStringProps(rawRoleType);

  // --- 2. DTO Validation ---
  const roleTypeDto = plainToInstance(
    CreateUserRoletypeDto,
    processedRawRoleType,
  );

  const errors = await validate(roleTypeDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping user role type due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawRoleType)}`,
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }
  // --- End DTO Validation ---

  // --- 3. Data Transformation & Prisma Input Construction ---
  // Construct the Prisma Create Input object using the validated DTO data
  // Ensure the fields match your Prisma schema for UserRoletypes
  const createInput: Prisma.UserRoletypeCreateInput = {
    id: roleTypeDto.id,
    role: roleTypeDto.role,
    description: roleTypeDto.description,
    // Add any other required fields from your UserRoletypes model schema here
  };

  return createInput; // Return the data ready for Prisma
};

/**
 * Seeds user role type data using the generic utility.
 * @param prisma - The Prisma client instance.
 */
export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'UserRoletypes', // Make sure this matches your Prisma model name
    jsonFilePath: userRoletypeJsonPath,
    prismaDelegate: prisma.userRoletype, // Make sure this matches your Prisma model delegate
    transformAndValidate: transformAndValidateUserRoletypes,
    uniqueKey: 'id', // Use 'id' or 'role' as the unique identifier based on your schema
  });
}

// Optional: If you want to run this seed independently or from a master seed file
// If running independently:
// const prisma = new PrismaClient();
// main(prisma)
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
