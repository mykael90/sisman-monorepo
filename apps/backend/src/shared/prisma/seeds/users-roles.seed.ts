// prisma/seeds/user-roles.seed.ts
import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn
} from './seed-utils';
import { CreateUserRoleDto } from '../../../modules/users/dto/role/create-user-role.dto'; // Adjust path if needed

const logger = console;
const userRolesJsonPath = '../data/users-roles.json'; // Assuming data is in this file

const transformAndValidateUserRole: TransformValidateFn<
  any,
  Prisma.UserRoleCreateInput
> = async (rawUserRole): Promise<Prisma.UserRoleCreateInput | null> => {
  // --- 1. Pre-process Raw Data ---
  const processedRawUserRole = removeNullOrEmptyStringProps(rawUserRole);

  // --- 2. DTO Validation ---
  // Use the pre-processed data for DTO instantiation
  // Ensure numbers are transformed correctly if coming from JSON as strings
  const userRoleDto = plainToInstance(CreateUserRoleDto, processedRawUserRole, {
    enableImplicitConversion: true // Helps convert string numbers from JSON if needed
  });

  const errors = await validate(userRoleDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping user role due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawUserRole)}`
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }
  // --- End DTO Validation ---

  // --- 3. Data Transformation & Prisma Input Construction ---
  // Construct the Prisma Create Input object using the validated DTO data
  const createInput: Prisma.UserRoleCreateInput = {
    // Assuming relation is established via IDs
    user: { connect: { id: userRoleDto.userId } },
    userRoletype: { connect: { id: userRoleDto.userRoletypeId } }
  };

  return createInput; // Return the data ready for Prisma
};

/**
 * Seeds user role data using the generic utility.
 * @param prisma - The Prisma client instance.
 */
export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'UserRole',
    jsonFilePath: userRolesJsonPath,
    prismaDelegate: prisma.userRole,
    transformAndValidate: transformAndValidateUserRole
    // Note: A simple unique key isn't obvious for a join table like UserRole.
    // The unique constraint is usually on the combination of userId and userRoletypeId.
    // The seedModel utility might need adjustment if upsert based on a single key is required.
    // For simple creation, omitting uniqueKey might work if duplicates are handled by DB constraints or clean data.
  });
}
